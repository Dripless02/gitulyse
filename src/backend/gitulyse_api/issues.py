from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from github import Auth, Github, BadCredentialsException

bp = Blueprint('issues', __name__)


def calculate_percentage_issues_resolved(issues, start_date, end_date):
    total_issues_resolved = 0
    for issue in issues:
        if issue.closed_at is not None:
            if start_date.timestamp() <= issue.closed_at.timestamp() <= end_date.timestamp():
                total_issues_resolved += 1
    return total_issues_resolved


@bp.route("/get-issues", methods=["GET"])
def get_issues():
    token = request.args.get("token")
    owner = request.args.get("owner")
    repo_name = request.args.get("repo")

    if owner is None or owner == "":
        return jsonify({"message": "No owner provided"}), 400
    else:
        owner = owner.lower()

    if repo_name is None or repo_name == "":
        return jsonify({"message": "No repo provided"}), 400
    else:
        repo_name = repo_name.lower()

    repo = f"{owner}/{repo_name}"

    auth = Auth.Token(token)
    gh = Github(auth=auth)

    try:
        repo = gh.get_repo(repo)
    except BadCredentialsException:
        return jsonify({"message": "Invalid token"}), 401
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


@bp.route("/get-percentage-issues", methods=["GET"])
def get_percentage_issues():
    token = request.args.get("token")
    owner = request.args.get("owner")
    repo_name = request.args.get("repo")
    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    if owner is None or owner == "":
        return jsonify({"message": "No owner provided"}), 400
    else:
        owner = owner.lower()

    if repo_name is None or repo_name == "":
        return jsonify({"message": "No repo provided"}), 400
    else:
        repo_name = repo_name.lower()

    if start_date_str is None or start_date_str == "":
        return jsonify({"message": "No start date provided"}), 400

    if end_date_str is None or end_date_str == "":
        return jsonify({"message": "No end date provided"}), 400

    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').replace(tzinfo=timezone.utc)
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(tzinfo=timezone.utc)

    repo = f"{owner}/{repo_name}"

    auth = Auth.Token(token)
    gh = Github(auth=auth)

    try:
        repo = gh.get_repo(repo)
    except BadCredentialsException:
        return jsonify({"message": "Invalid token"}), 401
    issues = repo.get_issues(state="all", direction="asc")

    total_issues = 0
    for issue in issues:
        if start_date.timestamp() <= issue.created_at.timestamp() <= end_date.timestamp():
            total_issues += 1

    total_issues_resolved = calculate_percentage_issues_resolved(issues, start_date, end_date)

    if total_issues > 0:
        percentage_issues_resolved = round((total_issues_resolved / total_issues) * 100, 1)
    else:
        percentage_issues_resolved = 0

    return jsonify({
        "total_issues": total_issues,
        "issues_resolved": total_issues_resolved,
        "percentage_issues_resolved": percentage_issues_resolved
    })
