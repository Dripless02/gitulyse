from flask import Blueprint, request, jsonify
from github import Auth, Github
from datetime import datetime, timezone
bp = Blueprint('issues', __name__)

def calculate_percentage_issues_resolved(issues, start_date, end_date):
    total_issues_resolved = 0
    for issue in issues:
        if issue.closed_at is not None and issue.created_at >= start_date and issue.closed_at <= end_date:
            total_issues_resolved += 1
    return total_issues_resolved

# get issues get request
@bp.route("/get-issues", methods=["GET"])
def get_issues():
    token = request.args.get("token")
    owner = request.args.get("owner").lower()
    repo_name = request.args.get("repo").lower()

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

@bp.route("/get-percentage-issues", methods=["GET"])
def get_percentage_issues():
    token = request.args.get("token")
    owner = request.args.get("owner").lower()
    repo_name = request.args.get("repo").lower()
    start_date_str = request.args.get("start_date")
    end_date_str = request.args.get("end_date")

    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').replace(tzinfo=timezone.utc)
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(tzinfo=timezone.utc)

    repo = f"{owner}/{repo_name}"

    auth = Auth.Token(token)
    g = Github(auth=auth)

    repo = g.get_repo(repo)
    issues = repo.get_issues(state="all", direction="asc")

    total_issues = 0
    for issue in issues:
        if issue.created_at >= start_date and issue.created_at <= end_date:
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