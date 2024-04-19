from datetime import datetime
from time import time

import pytest
from github import Github, GithubException

expected_repos = {
    "repos": [
        {
            "commit_count": 10,
            "name": "mock_user/test_repo1",
            "last_commit": datetime.fromtimestamp(1704067200).strftime("%a, %d %b %Y %H:%M:%S GMT")
        },
        {
            "commit_count": 20,
            "name": "mock_user/test_repo2",
            "last_commit": datetime.fromtimestamp(1704067200).strftime("%a, %d %b %Y %H:%M:%S GMT")
        },
    ]
}


@pytest.mark.parametrize("repos_setup", [2], indirect=True)
def test_get_repos(client, repos_setup):
    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

    assert response.status_code == 200
    assert response.json == expected_repos


def test_get_repos_incorrect_token(client):
    response = client.get("/get-repos?token=incorrect_token")

    assert response.status_code == 401
    assert response.json == {"message": "Invalid token"}


@pytest.mark.parametrize("repos_setup", [2], indirect=True)
def test_get_repos_limit_one(client, repos_setup):
    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&limit=1")

    assert response.status_code == 200
    assert response.json == {
        "repos": [
            {
                "commit_count": 10,
                "name": "mock_user/test_repo1",
                "last_commit": datetime.fromtimestamp(1704067200).strftime("%a, %d %b %Y %H:%M:%S GMT")
            }
        ]
    }


@pytest.mark.parametrize("repos_setup", [2], indirect=True)
def test_get_repos_force_true(client, repos_setup, mock_db):
    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&force=true")

    assert response.status_code == 200
    assert response.json == expected_repos


@pytest.mark.parametrize("repos_setup", [3], indirect=True)
def test_get_repos_force_true_extra_repo(client, repos_setup, mock_db):
    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&force=true")

    assert response.status_code == 200
    assert response.json == {
        "repos": [
            {
                "commit_count": 10,
                "name": "mock_user/test_repo1",
                "last_commit": datetime.fromtimestamp(1704067200).strftime("%a, %d %b %Y %H:%M:%S GMT")
            },
            {
                "commit_count": 20,
                "name": "mock_user/test_repo2",
                "last_commit": datetime.fromtimestamp(1704067200).strftime("%a, %d %b %Y %H:%M:%S GMT")
            },
            {
                "commit_count": 30,
                "name": "mock_user/test_repo3",
                "last_commit": datetime.fromtimestamp(1704067200).strftime("%a, %d %b %Y %H:%M:%S GMT")
            },
        ]
    }


@pytest.mark.parametrize("repos_setup", [2], indirect=True)
def test_get_repos_last_update_doc_not_none(client, repos_setup, mock_db):
    mock_db.repos["mock_user"].insert_one(
        {"name": "last_update", "total_repos": 10, "timestamp": 1700000000})
    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

    assert response.status_code == 200
    assert response.json == expected_repos


@pytest.mark.parametrize("repos_setup", [2], indirect=True)
def test_get_repos_last_update_doc_not_none_time_diff(client, repos_setup, mock_db):
    mock_db.repos["mock_user"].insert_one({
        "name": "last_update",
        "total_repos": 10,
        "timestamp": time()
    })
    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

    assert response.status_code == 200
    assert response.json == expected_repos


def test_get_repos_no_commits(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    user_mock = mocker.Mock(login="mock_user")
    repo_mock = mocker.Mock(full_name=f"mock_user/test_repo1")
    repo_mock.get_commits.side_effect = GithubException(
        status=500, data={}, headers={}
    )
    user_mock.get_repos.return_value = [
        repo_mock
    ]
    github_client_mock.get_user.return_value = user_mock
    mocker.patch("gitulyse_api.repos.Github", return_value=github_client_mock)

    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    assert response.status_code == 200
    assert response.json == {"repos": [{"commit_count": 0, "name": "mock_user/test_repo1"}]}


def test_get_repo_stats(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    repo_mock = mocker.Mock()
    repo_mock.full_name = "mock_user/test_repo"
    repo_mock.stargazers_count = 10
    repo_mock.forks_count = 20
    repo_mock.watchers_count = 30
    repo_mock.size = 100000
    repo_mock.get_languages.return_value = {"Python": 1000, "JavaScript": 2000}
    repo_mock.get_pulls.side_effect = [mocker.Mock(totalCount=5), mocker.Mock(totalCount=10)]
    repo_mock.get_contributors.return_value = [
        mocker.Mock(login="mock_user", contributions=10),
        mocker.Mock(login="mock_user_2", contributions=20)
    ]

    github_client_mock.get_repo.return_value = repo_mock
    mocker.patch("gitulyse_api.repos.Github", return_value=github_client_mock)

    response = client.get(
        "/get-repo-stats?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo")
    assert response.status_code == 200
    assert response.json == {
        "stars": 10,
        "forks": 20,
        "watchers": 30,
        "open_pull_requests": 5,
        "pull_requests": 10,
        "size": 100000,
        "languages": {"Python": 1000, "JavaScript": 2000},
        "contributors": [
            {"login": "mock_user", "contributions": 10},
            {"login": "mock_user_2", "contributions": 20},
        ],
    }


def test_get_repo_stats_incorrect_token(client):
    response = client.get("/get-repo-stats?token=incorrect_token&owner=mock_user&repo=test_repo")

    assert response.status_code == 401
    assert response.json == {"message": "Invalid token"}


def test_get_repo_stats_no_owner(client):
    response = client.get("/get-repo-stats?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&repo=test_repo")

    assert response.status_code == 400
    assert response.json == {"message": "No owner provided"}


def test_get_repo_stats_no_repo(client):
    response = client.get("/get-repo-stats?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user")

    assert response.status_code == 400
    assert response.json == {"message": "No repo provided"}
