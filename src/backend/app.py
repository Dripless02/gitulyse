from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from github import Auth, Github

load_dotenv()

app = Flask(__name__)
CORS(app)


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

    auth = Auth.Token(token)
    g = Github(auth=auth)

    user = g.get_user()
    repos = user.get_repos(sort="updated")
    repo_list = []
    for repo in repos:
        if len(repo_list) == 6:
            break
        repo_info = {
            "name": repo.full_name,
            "commit_count": repo.get_commits(author=user).totalCount,
        }
        repo_list.append(repo_info)

    return jsonify({"repos": repo_list})


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
    for pull_request in pull_requests:
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

        pull_request_list.append(pull_request_info)

    return jsonify({"pull_requests": pull_request_list})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
