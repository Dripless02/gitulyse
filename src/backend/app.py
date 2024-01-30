from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from github import Auth, Github

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def index():
    data = {
        "data": "Hello from the Gitulyse backend index endpoint",
    }

    return data, 200


@app.route("/github-token", methods=["POST"])
def github_token():
    token = request.get_json()["access_token"]
    print("Token Retrieved from Frontend")
    return "Token Retrieved from Frontend", 200


@app.route("/get-repos", methods=["GET"])
def get_repos():
    token = request.args.get("token")

    auth = Auth.Token(token)
    g = Github(auth=auth)

    repos = g.get_user().get_repos(affiliation="owner")
    repo_list = []
    for repo in repos:
        repo_list.append(repo.full_name)

    return jsonify({"repos": repo_list})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
