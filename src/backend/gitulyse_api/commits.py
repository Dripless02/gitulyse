from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

import pymongo
from flask import Blueprint, jsonify, request
from github import Auth, Github

from .db import get_db

bp = Blueprint('commits', __name__)


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


@bp.route("/get-commits", methods=["GET"])
def get_commits_from_repo():
    token = request.args.get("token")
    owner = request.args.get("owner")
    repo_name = request.args.get("repo")

    db_client = get_db()

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
