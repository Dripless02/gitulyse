from concurrent.futures import ThreadPoolExecutor
from time import time

from flask import Blueprint, jsonify, request, current_app
from github import Auth, Github, BadCredentialsException

from gitulyse_api.db import get_db

bp = Blueprint('users', __name__)


def calculate_addition_deletions(commit):
    additions = 0
    deletions = 0
    for file in commit.files:
        additions += file.additions
        deletions += file.deletions
    return additions, deletions


def parse_repo(repo_user):
    repo, user_login = repo_user
    commits = repo.get_commits(author=user_login)

    contribution_counts = {
        "additions": 0,
        "deletions": 0,
        "commits": 0,
    }

    with ThreadPoolExecutor(max_workers=3) as executor:
        for addition, deletion in executor.map(calculate_addition_deletions, commits):
            contribution_counts["additions"] += addition
            contribution_counts["deletions"] += deletion
            contribution_counts["commits"] += 1
    return contribution_counts


@bp.route("/get-user", methods=["GET"])
def get_user():
    token = request.args.get("token")
    user = request.args.get("user")
    force = request.args.get("force")

    db_client = get_db()

    try:
        auth = Auth.Token(token)
        g = Github(auth=auth)

        if user:
            user = g.get_user(user)
        else:
            user = g.get_user()
    except BadCredentialsException:
        return jsonify({"message": "Invalid token"}), 401

    try:
        latest_user_info = db_client["users"][user.login].find({}, {"_id": 0}).sort("timestamp", -1).limit(1)[0]
        if not force and latest_user_info["timestamp"] > time() - 3600:
            return jsonify(latest_user_info), 200
    except IndexError:
        pass

    user_info = {
        "login": user.login,
        "name": user.name,
        "email": user.email,
        "location": user.location,
        "bio": user.bio,
        "public_repo_count": user.public_repos,
        "created_at": user.created_at,
        "avatar_url": user.avatar_url,
        "html_url": user.html_url,
        "contribution_counts": {
            "additions": 0,
            "deletions": 0,
            "commits": 0,
        },
        "repos": {}
    }

    all_user_repos = [repo for repo in user.get_repos(type="all")]
    user_info["repos"] = [{"name": repo.full_name, "html_url": repo.html_url} for repo in all_user_repos]

    start_time = time()
    with ThreadPoolExecutor(max_workers=10) as repo_executor:
        contribution_counts = repo_executor.map(parse_repo, [(repo, user.login) for repo in all_user_repos])
        for repo_contribution_counts in contribution_counts:
            user_info["contribution_counts"]["additions"] += repo_contribution_counts["additions"]
            user_info["contribution_counts"]["deletions"] += repo_contribution_counts["deletions"]
            user_info["contribution_counts"]["commits"] += repo_contribution_counts["commits"]
    end_time = time()
    current_app.logger.info(f"Time taken to calculate contributions: {end_time - start_time}")

    user_info["timestamp"] = time()

    db_client["users"][user.login].insert_one(user_info.copy())

    return jsonify(user_info), 200
