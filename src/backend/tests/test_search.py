from github import Github, BadCredentialsException


def test_search_no_query(client):
    response = client.get("/search?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX?type=user")
    assert response.status_code == 400
    assert response.json == {"message": "No query provided"}


def test_search_no_type(client):
    response = client.get("/search?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&query=test")
    assert response.status_code == 400
    assert response.json == {"message": "No type provided"}


def test_search_user(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    search_result_mock = [
        mocker.Mock(login="mock_user"),
        mocker.Mock(login="mock_user2"),
    ]
    github_client_mock.search_users.return_value = search_result_mock
    mocker.patch("gitulyse_api.search.Github", return_value=github_client_mock)

    response = client.get("/search?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&query=test&type=user")
    assert response.status_code == 200
    assert response.json == {"results": ["mock_user", "mock_user2"]}


def test_search_repo(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    search_result_mock = [
        mocker.Mock(full_name="mock_user/test_repo"),
        mocker.Mock(full_name="mock_user/test_repo2"),
    ]

    github_client_mock.search_repositories.return_value = search_result_mock
    mocker.patch("gitulyse_api.search.Github", return_value=github_client_mock)
    response = client.get("/search?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&query=test&type=repo")
    assert response.status_code == 200
    assert response.json == {"results": ["mock_user/test_repo", "mock_user/test_repo2"]}


def test_search_invalid_credentials(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    github_client_mock.get_user.side_effect = BadCredentialsException(status=401)
    mocker.patch("gitulyse_api.search.Github", return_value=github_client_mock)

    response = client.get("/search?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&query=test&type=user")
    assert response.status_code == 401
    assert response.json == {"message": "Invalid token"}


def test_search_index_error_users(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    github_client_mock.search_users.side_effect = IndexError
    mocker.patch("gitulyse_api.search.Github", return_value=github_client_mock)

    response = client.get("/search?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&query=test&type=user")
    assert response.status_code == 200
    assert response.json == {"results": []}


def test_search_index_error_repos(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    github_client_mock.search_repositories.side_effect = IndexError
    mocker.patch("gitulyse_api.search.Github", return_value=github_client_mock)

    response = client.get("/search?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&query=test&type=repo")
    assert response.status_code == 200
    assert response.json == {"results": []}
