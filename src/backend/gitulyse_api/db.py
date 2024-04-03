from flask import current_app, g
from pymongo import MongoClient


def get_db() -> MongoClient:
    if "db" not in g:
        if current_app.config["TESTING"]:
            g.db = current_app.config["MOCK_DB"]
        else:
            g.db = MongoClient(current_app.config["MONGO_URI"])

    return g.db


def close_db(e=None):
    db = g.pop("db", None)

    if db is not None:
        db.close()


def init_app(app):
    app.teardown_appcontext(close_db)
