from flask import Blueprint, request, jsonify
from github import Auth, Github

bp = Blueprint('issues', __name__)


# get issues get request
@bp.route("/get-issues", methods=["GET"])
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
