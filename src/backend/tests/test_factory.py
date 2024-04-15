from datetime import datetime

from github import Github

from gitulyse_api import create_app


def test_create_app_config():
    assert not create_app().testing
    assert create_app({"TESTING": True}).testing


def test_index(client):
    response = client.get("/")
    assert response.json == {"data": "Hello from the Gitulyse backend index endpoint"}
    assert response.status_code == 200


def test_github_activity(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    user_mock = mocker.Mock()
    user_mock.get_events.return_value = [
        mocker.Mock(created_at=datetime.strptime("2024-01-01", "%Y-%m-%d")),
        mocker.Mock(created_at=datetime.strptime("2024-01-01", "%Y-%m-%d")),
        mocker.Mock(created_at=datetime.strptime("2024-01-02", "%Y-%m-%d")),
    ]
    github_client_mock.get_user.return_value = user_mock
    mocker.patch('gitulyse_api.Github', return_value=github_client_mock)

    response = client.get("/github-activity?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=test_user")
    assert response.status_code == 200
    assert response.json == [
        {"day": "2024-01-01", "value": 2},
        {"day": "2024-01-02", "value": 1},
    ]


def test_github_activity_day(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    user_mock = mocker.Mock()
    event_one_mock = mocker.Mock(
        id="123456",
        type="PushEvent",
        actor=mocker.Mock(login="test_user"),
        created_at=datetime.strptime("2024-01-01", "%Y-%m-%d"),
        payload=mocker.Mock(),
        repo=mocker.Mock(),
    )
    event_one_mock.repo.name = "test_user/test_repo"
    event_one_mock.payload = {"commits": [{"sha": "123456", "message": "test commit"}]}

    event_two_mock = mocker.Mock(
        id="654321",
        type="PushEvent",
        actor=mocker.Mock(login="test_user"),
        created_at=datetime.strptime("2024-01-02", "%Y-%m-%d"),
        payload=mocker.Mock(),
        repo=mocker.Mock(),
    )

    user_mock.get_events.return_value = [event_one_mock, event_two_mock]

    github_client_mock.get_user.return_value = user_mock
    mocker.patch('gitulyse_api.Github', return_value=github_client_mock)

    response = client.get(
        "/github-activity-day?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=test_user&date=2024-01-01")
    assert response.status_code == 200
    assert response.json == [
        {
            "type": "PushEvent",
            "repo": "test_user/test_repo",
            "created_at": "2024-01-01T00:00:00",
            "payload": {"commits": [{"sha": "123456", "message": "test commit"}]},
        }
    ]
