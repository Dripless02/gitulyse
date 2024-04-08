from concurrent.futures import ThreadPoolExecutor
from time import time

from flask import Blueprint, jsonify, request
from github import Auth, Github, BadCredentialsException

from gitulyse_api.commits import parse_contributions
from gitulyse_api.db import get_db

bp = Blueprint('users', __name__)


@bp.route("/get-user", methods=["GET"])
def get_user():
    token = request.args.get("token")
    user = request.args.get("user").lower()
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
        latest_user_info = db_client["users"][user.login.lower()].find({}, {"_id": 0}).sort("timestamp", -1).limit(1)[0]
        if not force and latest_user_info["timestamp"] > time() - 600:
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
        "repos": {}
    }

    all_user_repos = [repo for repo in user.get_repos(type="all")]
    user_info["repos"] = [{"name": repo.full_name, "html_url": repo.html_url} for repo in all_user_repos]

    contributions = get_user_contributions(all_user_repos, user)

    user_info["repo_contributions"] = contributions["repo_contributions"]
    user_info["overall_contributions"] = contributions["overall_contributions"]
    user_info["timestamp"] = time()
    db_client["users"][user.login.lower()].insert_one(user_info.copy())

    return jsonify(user_info), 200


def process_repo(repo, user, contributions_per_repo, overall_contributions):
    contributions_per_repo[repo.full_name] = {}

    stats_contributors = repo.get_stats_contributors()
    if stats_contributors is None:
        log.info(f"{repo.full_name} was None")
        return

    for week in stats_contributors[0].weeks:
        week_formatted = week.w.date().strftime("%Y-%m")
        contributions_per_repo[repo.full_name][week_formatted] = {
            "additions": 0,
            "deletions": 0,
            "commits": 0,
        }
        if week_formatted not in overall_contributions:
            overall_contributions[week_formatted] = {
                "additions": 0,
                "deletions": 0,
                "commits": 0,
            }

    user_stats_contributor = next(
        (contributor for contributor in stats_contributors if contributor.author.login == user.login), None)

    with ThreadPoolExecutor(max_workers=2) as parse_executor:
        parse_executor.submit(parse_contributions, user_stats_contributor, contributions_per_repo[repo.full_name],
                              True)
        parse_executor.submit(parse_contributions, user_stats_contributor, overall_contributions, True)


def get_user_contributions(all_user_repos, user):
    contributions_per_repo = {}
    overall_contributions = {}

    with ThreadPoolExecutor(max_workers=5) as executor:
        _ = [executor.submit(process_repo, repo, user, contributions_per_repo, overall_contributions) for repo in
             all_user_repos]

    return {
        "repo_contributions": contributions_per_repo,
        "overall_contributions": overall_contributions
    }
