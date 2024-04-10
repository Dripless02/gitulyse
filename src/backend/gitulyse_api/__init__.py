import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from github import Auth, Github

from . import pull_requests, repos, commits, issues, db, users


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config["MONGO_URI"] = os.getenv("MONGODB_URL")

    CORS(app)

    if test_config is None:
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.update(test_config)

    db.init_app(app)

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

    @app.route("/github-activity", methods=["GET"])
    def github_activity():
        token = request.args.get("token")
        user = request.args.get("user").lower()

        auth = Auth.Token(token)
        g = Github(auth=auth)

        user = g.get_user(user)
        events = user.get_events()

        activity_map = {}
        for event in events:
            created_at = event.created_at.date()

            if created_at not in activity_map:
                activity_map[created_at] = 0
            activity_map[created_at] += 1

        formatted_activity = [{"day": date.isoformat(), "value": count} for date, count in activity_map.items()]

        return jsonify(formatted_activity)

    app.register_blueprint(pull_requests.bp)
    app.register_blueprint(repos.bp)
    app.register_blueprint(commits.bp)
    app.register_blueprint(issues.bp)
    app.register_blueprint(users.bp)

    return app
