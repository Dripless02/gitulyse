from flask import Blueprint, request, jsonify
from github import Github, Auth, BadCredentialsException

bp = Blueprint('search', __name__)


@bp.route("/search", methods=["GET"])
def search():
    token = request.args.get("token")
    query = request.args.get("query")

    if query == "":
        return jsonify({"message": "No query provided"}), 400

    try:
        auth = Auth.Token(token)
        g = Github(auth=auth)
    except BadCredentialsException:
        return jsonify({"message": "Invalid token"}), 401

    try:
        user_results = [user.login for user in g.search_users(query=query)[:25]]
    except IndexError:
        user_results = []

    try:
        repo_results = [repo.full_name for repo in g.search_repositories(query=query)[:25]]
    except IndexError:
        repo_results = []

    return jsonify({
        "users": user_results,
        "repos": repo_results
    }), 200
