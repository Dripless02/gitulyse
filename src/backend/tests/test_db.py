import mongomock
from flask import g

from gitulyse_api.db import get_db, close_db


def test_get_db(app):
    with (app.app_context()):
        db = get_db()
        assert isinstance(db, mongomock.MongoClient)
        assert db == get_db()


def test_close_db(app):
    with app.app_context():
        get_db()
        assert 'db' in g
        close_db()
        assert 'db' not in g


def test_init_app(app):
    assert close_db in app.teardown_appcontext_funcs
