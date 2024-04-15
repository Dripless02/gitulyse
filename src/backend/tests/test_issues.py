from github import Github


def test_get_issues(client, issues_setup):
    response = client.get(
        "/get-issues?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
    )
    assert response.status_code == 200
    assert response.json == {
        "average_time_to_resolve": 86400.0,
        "issues": [
            {
                "author": "mock_user",
                "closed_at": "Tue, 02 Jan 2024 00:00:00 GMT",
                "created_at": "Mon, 01 Jan 2024 00:00:00 GMT",
                "issue_number": 1,
                "state": "closed",
                "time_to_close": {
                    "days": 1, "hours": 0, "minutes": 0, "seconds": 0, "total_seconds": 86400
                },
                "title": "Test Issue 1", "updated_at": "Tue, 02 Jan 2024 00:00:00 GMT"
            },
            {
                "author": "mock_user",
                "created_at": "Mon, 01 Jan 2024 00:00:00 GMT",
                "issue_number": 2,
                "state": "open",
                "title": "Test Issue 2",
                "updated_at": "Tue, 02 Jan 2024 00:00:00 GMT"
            },
        ]
    }


def test_get_issues_no_issues(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    repo_mock = mocker.Mock()
    repo_mock.get_issues.return_value = []
    github_client_mock.get_repo.return_value = repo_mock
    mocker.patch("gitulyse_api.issues.Github", return_value=github_client_mock)

    response = client.get(
        "/get-issues?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
    )
    assert response.status_code == 200
    assert response.json == {
        "average_time_to_resolve": 0,
        "issues": []
    }


def test_get_percentage_issues(client, issues_setup):
    response = client.get(
        "/get-percentage-issues?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
        "&start_date=2024-01-01&end_date=2024-01-03"
    )
    assert response.status_code == 200
    assert response.json == {
        "issues_resolved": 1,
        "percentage_issues_resolved": 50.0,
        "total_issues": 2
    }


def test_get_percentage_issues_no_issues(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    repo_mock = mocker.Mock()
    repo_mock.get_issues.return_value = []
    github_client_mock.get_repo.return_value = repo_mock
    mocker.patch("gitulyse_api.issues.Github", return_value=github_client_mock)

    response = client.get(
        "/get-percentage-issues?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
        "&start_date=2024-01-01&end_date=2024-01-03"
    )
    assert response.status_code == 200
    assert response.json == {
        "issues_resolved": 0,
        "percentage_issues_resolved": 0.0,
        "total_issues": 0
    }


def test_get_percentage_issues_incorrect_dates(client, issues_setup):
    response = client.get(
        "/get-percentage-issues?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
        "&start_date=2025-01-01&end_date=2024-01-03"
    )
    assert response.status_code == 200
    assert response.json == {
        "issues_resolved": 0, "percentage_issues_resolved": 0, "total_issues": 0
    }
