from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

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


@bp.route("/get-percentage-pull-requests", methods=["GET"])
def get_percentage_pull_requests():
    token = request.args.get("token")
    owner = request.args.get("owner").lower()
    repo_name = request.args.get("repo").lower()
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    start_date = datetime.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
    end_date = datetime.strptime(end_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)

    repo = f"{owner}/{repo_name}"

    g = Github(token)

    repo = g.get_repo(repo)
    pull_requests = repo.get_pulls(state="all", direction="asc")

    total_pull_requests = 0
    merged_pull_requests = 0

    for pull_request_info in pull_requests:
        parsed_pull_request = parse_pull_request(pull_request_info)
        created_at = parsed_pull_request.get("created_at")
        merged_at = parsed_pull_request.get("merged_at")

        if created_at is not None and start_date.timestamp() <= created_at.timestamp() <= end_date.timestamp():
            total_pull_requests += 1
            if (parsed_pull_request.get("state") == "merged"
                    and merged_at is not None and start_date.timestamp() <= merged_at.timestamp() <= end_date.timestamp()):
                merged_pull_requests += 1

    if total_pull_requests > 0:
        percentage_merged = round((merged_pull_requests / total_pull_requests) * 100, 1)
    else:
        percentage_merged = 0

    return jsonify({
        "total_pull_requests": total_pull_requests,
        "merged_pull_requests": merged_pull_requests,
        "percentage_merged": percentage_merged
    })


@bp.route("/get-pull-requests", methods=["GET"])
def get_pull_requests():
    token = request.args.get("token")
    owner = request.args.get("owner").lower()
    repo_name = request.args.get("repo").lower()

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
