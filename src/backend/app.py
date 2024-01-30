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
        jsonify(
            {
                "data": "Hello from the Gitulyse backend index endpoint",
            }
        ),
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


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
