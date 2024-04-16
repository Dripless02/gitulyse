from unittest import mock

from github import UnknownObjectException, Github, BadCredentialsException

expected_user = {
    "avatar_url": "https://test.com/avatar",
    "bio": "Test bio",
    "created_at": "Sat, 01 Jan 2022 00:00:00 GMT",
    "email": "mock_user@test.com",
    "html_url": "https://github.com/mock_user",
    "languages": {"Python": 200},
    "location": "Test location",
    "login": "mock_user",
    "name": "Mock User",
    "overall_contributions": {
        "2022-01": {"additions": 0, "commits": 0, "deletions": 0}
    },
    "public_repo_count": 2,
    "pull_request_count": 1,
    "repo_contributions": {
        "mock_user/test_repo": {
            "2022-01": {"additions": 0, "commits": 0, "deletions": 0}
        },
        "mock_user/test_repo2": {
            "2022-01": {"additions": 0, "commits": 0, "deletions": 0}
        }
    },
    "repos": [
        {
            "html_url": "https://github.com/mock_user/test_repo",
            "name": "mock_user/test_repo"
        },
        {
            "html_url": "https://github.com/mock_user/test_repo2",
            "name": "mock_user/test_repo2"
        }
    ],
    "timestamp": mock.ANY
}


def test_get_user(client, mock_db, users_setup):
    response = client.get("/get-user?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=mock_user")
    assert response.status_code == 200
    assert response.json == expected_user


def test_get_user_cached_data(client, mock_db, users_setup, users_db_setup):
    response = client.get("/get-user?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=mock_user")
    assert response.status_code == 200
    assert response.json == expected_user


def test_get_user_force(client, mock_db, users_setup, users_db_setup):
    response = client.get("/get-user?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=mock_user&force=true")
    assert response.status_code == 200
    assert response.json == expected_user


def test_get_user_no_stats_contributors(client, mocker, mock_db, users_base_setup):
    github_client_mock, user_mock, repo_mock_1, repo_mock_2 = users_base_setup
    repo_mock_1.get_stats_contributors.return_value = None
    repo_mock_2.get_stats_contributors.return_value = None
    user_mock.get_repos.return_value = [repo_mock_1, repo_mock_2]
    github_client_mock.get_user.return_value = user_mock
    github_client_mock.search_issues.return_value = [mocker.Mock()]
    mocker.patch("gitulyse_api.users.Github", return_value=github_client_mock)

    response = client.get("/get-user?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=mock_user")

    assert response.status_code == 200
    assert response.json == {
        "avatar_url": "https://test.com/avatar",
        "bio": "Test bio",
        "created_at": "Sat, 01 Jan 2022 00:00:00 GMT",
        "email": "mock_user@test.com",
        "html_url": "https://github.com/mock_user",
        "languages": {"Python": 200},
        "location": "Test location",
        "login": "mock_user",
        "name": "Mock User",
        "overall_contributions": {},
        "public_repo_count": 2,
        "pull_request_count": 1,
        "repo_contributions": {
            "mock_user/test_repo": {},
            "mock_user/test_repo2": {}
        },
        "repos": [
            {"html_url": "https://github.com/mock_user/test_repo", "name": "mock_user/test_repo"},
            {"html_url": "https://github.com/mock_user/test_repo2", "name": "mock_user/test_repo2"}
        ],
        "timestamp": mocker.ANY
    }


def test_get_user_no_user_given(client, users_setup):
    response = client.get("/get-user?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    assert response.status_code == 200
    assert response.json == expected_user


def test_get_user_no_user_found(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    github_client_mock.get_user.side_effect = UnknownObjectException(status=404)
    mocker.patch("gitulyse_api.users.Github", return_value=github_client_mock)

    response = client.get("/get-user?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=mock_user")
    assert response.status_code == 404
    assert response.json == {"message": "User not found"}


def test_get_user_incorrect_token(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    github_client_mock.get_user.side_effect = BadCredentialsException(status=401)
    mocker.patch("gitulyse_api.users.Github", return_value=github_client_mock)

    response = client.get("/get-user?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=mock_user")
    assert response.status_code == 401
    assert response.json == {"message": "Invalid token"}
