from github import Github, BadCredentialsException


def test_get_pull_requests(client, pull_request_setup):
    response = client.get(
        "/get-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
    )
    assert response.status_code == 200


def test_get_pull_requests_incorrect_token(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    github_client_mock.get_repo.side_effect = BadCredentialsException(status=401)
    mocker.patch("gitulyse_api.pull_requests.Github", return_value=github_client_mock)

    response = client.get(
        "/get-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
    )
    assert response.status_code == 401
    assert response.json == {"message": "Invalid token"}


def test_get_pull_requests_no_owner(client):
    response = client.get("/get-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&repo=test_repo")
    assert response.status_code == 400
    assert response.json == {"message": "No owner provided"}


def test_get_pull_requests_no_repo(client):
    response = client.get("/get-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user")
    assert response.status_code == 400
    assert response.json == {"message": "No repo provided"}


def test_get_percentage_pull_requests(client, pull_request_setup):
    response = client.get(
        "/get-percentage-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
        "&start_date=2024-01-01&end_date=2024-01-03"
    )
    assert response.status_code == 200
    assert response.json == {
        "merged_pull_requests": 1,
        "percentage_merged": 33.3,
        "total_pull_requests": 3
    }


def test_get_percentage_pull_requests_no_pull_requests(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    repo_mock = mocker.Mock()
    repo_mock.get_pulls.return_value = []
    github_client_mock.get_repo.return_value = repo_mock
    mocker.patch("gitulyse_api.pull_requests.Github", return_value=github_client_mock)

    response = client.get(
        "/get-percentage-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
        "&start_date=2024-01-01&end_date=2024-01-03"
    )
    assert response.status_code == 200
    assert response.json == {
        "merged_pull_requests": 0,
        "percentage_merged": 0,
        "total_pull_requests": 0
    }


def test_get_percentage_pull_requests_incorrect_dates(client, pull_request_setup):
    response = client.get(
        "/get-percentage-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
        "&start_date=2025-01-01&end_date=2024-01-03"
    )
    assert response.status_code == 200
    assert response.json == {
        "merged_pull_requests": 0,
        "percentage_merged": 0,
        "total_pull_requests": 0
    }


def test_get_percentage_pull_requests_incorrect_token(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    github_client_mock.get_repo.side_effect = BadCredentialsException(status=401)
    mocker.patch("gitulyse_api.pull_requests.Github", return_value=github_client_mock)

    response = client.get(
        "/get-percentage-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
        "&start_date=2024-01-01&end_date=2024-01-03"
    )
    assert response.status_code == 401
    assert response.json == {"message": "Invalid token"}


def test_get_percentage_pull_requests_no_owner(client):
    response = client.get(
        "/get-percentage-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&repo=test_repo"
        "&start_date=2024-01-01&end_date=2024-01-03"
    )
    assert response.status_code == 400
    assert response.json == {"message": "No owner provided"}


def test_get_percentage_pull_requests_no_repo(client):
    response = client.get(
        "/get-percentage-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user"
        "&start_date=2024-01-01&end_date=2024-01-03"
    )
    assert response.status_code == 400
    assert response.json == {"message": "No repo provided"}


def test_get_percentage_pull_requests_no_start_date(client):
    response = client.get(
        "/get-percentage-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
        "&end_date=2024-01-03"
    )
    assert response.status_code == 400
    assert response.json == {"message": "No start date provided"}


def test_get_percentage_pull_requests_no_end_date(client):
    response = client.get(
        "/get-percentage-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
        "&start_date=2024-01-01"
    )
    assert response.status_code == 400
    assert response.json == {"message": "No end date provided"}
