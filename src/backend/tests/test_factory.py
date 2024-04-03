from gitulyse_api import create_app


def test_config():
    assert not create_app().testing
    assert create_app({"TESTING": True}).testing


def test_index(client):
    response = client.get("/")
    assert response.json == {"data": "Hello from the Gitulyse backend index endpoint"}
