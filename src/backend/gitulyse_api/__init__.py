import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from github import Auth, Github, BadCredentialsException

from . import pull_requests, repos, commits, issues, db, users, search


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

    @app.route("/github-activity", methods=["GET"])
    def github_activity():
        token = request.args.get("token")
        user = request.args.get("user")

        auth = Auth.Token(token)
        gh = Github(auth=auth)

        if user is None:
            return jsonify({"message": "No user provided"}), 400

        try:
            user = gh.get_user(user.lower())
        except BadCredentialsException:
            return jsonify({"message": "Invalid token"}), 401
        events = user.get_events()

        activity_map = {}
        for event in events:
            created_at = event.created_at.date()

            if created_at not in activity_map:
                activity_map[created_at] = 0
            activity_map[created_at] += 1

        formatted_activity = [{"day": date.isoformat(), "value": count} for date, count in activity_map.items()]

        return jsonify(formatted_activity)

    @app.route("/github-activity-day", methods=["GET"])
    def github_activity_day():
        token = request.args.get("token")
        user = request.args.get("user")
        date = request.args.get("date")

        if user is None:
            return jsonify({"message": "No user provided"}), 400

        if date is None:
            return jsonify({"message": "No date provided"}), 400

        auth = Auth.Token(token)
        gh = Github(auth=auth)

        try:
            user = gh.get_user(user.lower())
        except BadCredentialsException:
            return jsonify({"message": "Invalid token"}), 401
        events = user.get_events()

        events_list = []
        for event in events:
            created_at = event.created_at.date()

            if created_at.isoformat() == date:
                event_info = {
                    "type": event.type,
                    "repo": event.repo.name,
                    "created_at": event.created_at.isoformat(),
                    "payload": event.payload,
                }

                events_list.append(event_info)

        return jsonify(events_list)

    app.register_blueprint(pull_requests.bp)
    app.register_blueprint(repos.bp)
    app.register_blueprint(commits.bp)
    app.register_blueprint(issues.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(search.bp)

    return app
