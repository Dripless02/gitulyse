from concurrent.futures import ThreadPoolExecutor

from flask import Blueprint, jsonify, request
from github import Github, Auth

bp = Blueprint('pull_requests', __name__)


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


@bp.route("/get-pull-requests", methods=["GET"])
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
    with ThreadPoolExecutor(max_workers=20) as executor:
        for pull_request_info in executor.map(parse_pull_request, pull_requests):
            pull_request_list.append(pull_request_info)

    return jsonify({"pull_requests": pull_request_list})
