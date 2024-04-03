import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from time import time

import pymongo.database
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from github import Auth, Github, GithubException
from pymongo import MongoClient

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGODB_URL = os.getenv("MONGODB_URL")

db_client: MongoClient = MongoClient(MONGODB_URL)
all_db_repos: pymongo.database.Database = db_client.repos


@app.route("/", methods=["GET"])
def index():
    return (
        jsonify({"data": "Hello from the Gitulyse backend index endpoint"}),
        200,
    )


@app.route("/github-token", methods=["POST"])
def github_token():
    token = request.get_json()["access_token"]
    return jsonify({"message": "Token Retrieved from Frontend"}), 200


@app.route("/get-repos", methods=["GET"])
def get_repos():
    token = request.args.get("token")
    force = request.args.get("force")
    limit = request.args.get("limit")

    auth = Auth.Token(token)
    g = Github(auth=auth)

    user = g.get_user()
    db_user_repos = all_db_repos[user.login]

    current_date_time = time()
    last_update_doc = db_user_repos.find_one({"name": "last_update"})

    repos = user.get_repos(sort="updated")
    if (
            user.login in all_db_repos.list_collection_names()
            and force != "true"
            and last_update_doc is not None
    ):
        last_updated = last_update_doc["timestamp"]
        time_diff = current_date_time - last_updated
        if time_diff > 21600:
            force = "true"

    repo_list = []
    if user.login not in all_db_repos.list_collection_names() or force == "true":
        db_user_repos.create_index("name", unique=True)
        for repo in repos:
            repo_info = {
                "name": repo.full_name,
            }

            try:
                repo_info["commit_count"] = repo.get_commits(author=user.login).totalCount
            except GithubException:
                repo_info["commit_count"] = 0

            repo_list.append(repo_info)

            if db_user_repos.find_one({"name": repo.full_name}) is None:
                db_user_repos.update_one(
                    {"name": repo.full_name}, {"$set": repo_info.copy()}, upsert=True
                )
        db_user_repos.update_one(
            {"name": "last_update"},
            {
                "$set": {
                    "timestamp": current_date_time,
                    "total_repos": len(repo_list.copy()),
                }
            },
            upsert=True,
        )
    else:
        repo_list = list(
            db_user_repos.find({"name": {"$ne": "last_update"}}, {"_id": 0})
        )
    if limit is not None:
        return jsonify({"repos": repo_list[: int(limit)]})
    else:
        return jsonify({"repos": repo_list})


def parse_commit(commit):
    commit_date = commit.commit.author.date
    author_name = commit.author.login if commit.author is not None else commit.commit.author.name

    # Group commits by time intervals
    monthly_key = commit_date.strftime("%Y-%m")

    lines_of_code = commit.stats.additions - commit.stats.deletions

    commit_info = {
        "date": commit_date.isoformat(),
        "author": author_name,
        "lines_of_code": lines_of_code,
        "timestamp": datetime.timestamp(commit_date),
        "additions": commit.stats.additions,
        "deletions": commit.stats.deletions,
        "files_changed": len(commit.files),
        "message": commit.commit.message,
        "url": commit.html_url,
        "sha": commit.sha,
        "monthly_key": monthly_key,
    }

    return commit_info


@app.route("/get-commits", methods=["GET"])
def get_commits_from_repo():
    token = request.args.get("token")
    owner = request.args.get("owner")
    repo_name = request.args.get("repo")

    auth = Auth.Token(token)
    g = Github(auth=auth)

    repo = f"{owner}/{repo_name}"
    repo = g.get_repo(repo)

    # each user will have their own database that includes collections of their repos containing information on commits
    db_repo = db_client[owner][repo_name]

    commits = db_repo.find().sort("timestamp", pymongo.DESCENDING).limit(1)
    try:
        last_commit_timestamp = commits[0]["timestamp"]
    except IndexError:
        last_commit_timestamp = None

    if last_commit_timestamp is not None:
        commits = repo.get_commits(since=datetime.fromtimestamp(last_commit_timestamp))
    else:
        commits = repo.get_commits()

    commit_stats = {"monthly": {}}

    # get all stored commits from the database without the "_id" field
    stored_commits = list(db_repo.find({}, {"_id": 0}))

    for stored in stored_commits:
        commit_stats["monthly"].setdefault(stored["monthly_key"], []).append(stored)

    with ThreadPoolExecutor(max_workers=10) as executor:
        for commit_info in executor.map(parse_commit, commits):
            commit_stats["monthly"].setdefault(commit_info["monthly_key"], []).append(commit_info)
            db_repo.update_one(
                {"sha": commit_info["sha"]},
                {"$set": commit_info},
                upsert=True
            )

    app.logger.info(f"\033[96m commit_stats: {commit_stats} \033[0m")

    for monthly_key, monthly_commits in commit_stats["monthly"].items():
        total_lines_of_code = sum(commit["lines_of_code"] for commit in monthly_commits)
        average_lines_of_code = total_lines_of_code / len(monthly_commits)
        average_lines_of_code = round(average_lines_of_code, 1)
        commit_stats["monthly"][monthly_key] = {
            "total_lines_of_code": total_lines_of_code,
            "average_lines_of_code": average_lines_of_code,
            "commits": monthly_commits,
        }

    return jsonify(commit_stats)


def parse_pull_request(pull_request):
    pull_request_info = {
        "title": pull_request.title,
        "author": pull_request.user.login,
        "created_at": pull_request.created_at,
        "updated_at": pull_request.updated_at,
        "pr_number": pull_request.number,
    }

    if pull_request.merged_at is not None:
        pull_request_info["state"] = "merged"
        pull_request_info["merged_at"] = pull_request.merged_at

        time_to_merge = (
                pull_request.merged_at - pull_request.created_at
        ).total_seconds()

        days, remainder = divmod(time_to_merge, 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, seconds = divmod(remainder, 60)

        time_to_merge_obj = {
            "days": int(days),
            "hours": int(hours),
            "minutes": int(minutes),
            "seconds": int(seconds),
            "total_seconds": int(time_to_merge),
        }

        pull_request_info["time_to_merge"] = time_to_merge_obj
    elif pull_request.closed_at is not None:
        pull_request_info["state"] = pull_request.state
        pull_request_info["closed_at"] = pull_request.closed_at
    else:
        pull_request_info["state"] = pull_request.state

    return pull_request_info


@app.route("/get-pull-requests", methods=["GET"])
def get_pull_requests():
    token = request.args.get("token")
    owner = request.args.get("owner")
    repo_name = request.args.get("repo")

    repo = f"{owner}/{repo_name}"

    auth = Auth.Token(token)
    g = Github(auth=auth)

    repo = g.get_repo(repo)
    pull_requests = repo.get_pulls(state="all", direction="asc")
    pull_request_list = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        for pull_request_info in executor.map(parse_pull_request, pull_requests):
            pull_request_list.append(pull_request_info)

    return jsonify({"pull_requests": pull_request_list})


# get issues get request
@app.route("/get-issues", methods=["GET"])
def get_issues():
    token = request.args.get("token")
    owner = request.args.get("owner")
    repo_name = request.args.get("repo")

    repo = f"{owner}/{repo_name}"

    auth = Auth.Token(token)
    g = Github(auth=auth)

    repo = g.get_repo(repo)
    issues = repo.get_issues(state="all", direction="asc")

    issue_list = []
    total_time_to_resolve = 0
    total_issues_resolved = 0

    for issue in issues:
        issue_info = {
            "title": issue.title,
            "author": issue.user.login,
            "created_at": issue.created_at,
            "updated_at": issue.updated_at,
            "issue_number": issue.number,
        }

        if issue.closed_at is not None:
            total_issues_resolved += 1
            time_to_close = (issue.closed_at - issue.created_at).total_seconds()
            total_time_to_resolve += time_to_close

            issue_info["state"] = "closed"
            issue_info["closed_at"] = issue.closed_at

            days, remainder = divmod(time_to_close, 86400)
            hours, remainder = divmod(remainder, 3600)
            minutes, seconds = divmod(remainder, 60)

            time_to_close_obj = {
                "days": int(days),
                "hours": int(hours),
                "minutes": int(minutes),
                "seconds": int(seconds),
                "total_seconds": int(time_to_close),
            }

            issue_info["time_to_close"] = time_to_close_obj
        else:
            issue_info["state"] = issue.state

        issue_list.append(issue_info)

    if total_issues_resolved > 0:
        average_time_to_resolve = total_time_to_resolve / total_issues_resolved
    else:
        average_time_to_resolve = 0

    return jsonify({"issues": issue_list, "average_time_to_resolve": average_time_to_resolve})


@app.route("/github-activity", methods=["GET"])
def github_activity():
    token = request.args.get("token")
    user = request.args.get("user")

    auth = Auth.Token(token)
    g = Github(auth=auth)

    user = g.get_user(user)
    events = user.get_events()

    activity_map = {}
    for event in events:
        created_at = event.created_at.date()

        if created_at not in activity_map:
            activity_map[created_at] = 0
        activity_map[created_at] += 1

    formatted_activity = [{"day": date.isoformat(), "value": count} for date, count in activity_map.items()]

    return jsonify(formatted_activity)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
