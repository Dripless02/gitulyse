from flask import Blueprint, request, jsonify
from github import Github, Auth, BadCredentialsException

bp = Blueprint('search', __name__)


@bp.route("/search", methods=["GET"])
def search():
    token = request.args.get("token")
    query = request.args.get("query")
    search_type = request.args.get("type")

    if query == "" or query is None:
        return jsonify({"message": "No query provided"}), 400

    if search_type == "" or search_type is None:
        return jsonify({"message": "No type provided"}), 400
    else:
        search_type = search_type.lower()

    auth = Auth.Token(token)
    g = Github(auth=auth)
    try:
        _ = g.get_user().login
    except BadCredentialsException:
        return jsonify({"message": "Invalid token"}), 401

    results = []

    if search_type == "user":
        try:
            results = [user.login for user in g.search_users(query=query)[:25]]
        except IndexError:
            pass

    if search_type == "repo":
        try:
            results = [repo.full_name for repo in g.search_repositories(query=query)[:25]]
        except IndexError:
            pass

    return jsonify({
        "results": results
    }), 200
