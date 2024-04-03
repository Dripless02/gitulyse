from time import time

import pytest
from github import Github, GithubException

expected_repos = {
    "repos": [
        {"commit_count": 10, "name": "mock_user/test_repo1"},
        {"commit_count": 20, "name": "mock_user/test_repo2"},
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
    assert response.json == {'repos': [{'commit_count': 10, 'name': 'mock_user/test_repo1'}]}


@pytest.mark.parametrize("repos_setup", [2], indirect=True)
def test_get_repos_force_true(client, repos_setup, mock_db):
    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&force=true")

    assert response.status_code == 200
    assert response.json == expected_repos


@pytest.mark.parametrize("repos_setup", [3], indirect=True)
def test_get_repos_force_true_extra_repo(client, repos_setup, mock_db):
    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&force=true")

    assert response.status_code == 200
    assert response.json == {'repos': [{'commit_count': 10, 'name': 'mock_user/test_repo1'},
                                       {'commit_count': 20, 'name': 'mock_user/test_repo2'},
                                       {'commit_count': 30, 'name': 'mock_user/test_repo3'}, ]}


@pytest.mark.parametrize("repos_setup", [2], indirect=True)
def test_get_repos_last_update_doc_not_none(client, repos_setup, mock_db):
    mock_db.repos['mock_user'].insert_one(
        {"name": "last_update", "total_repos": 10, "timestamp": 1700000000})
    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

    assert response.status_code == 200
    assert response.json == expected_repos


@pytest.mark.parametrize("repos_setup", [2], indirect=True)
def test_get_repos_last_update_doc_not_none_time_diff(client, repos_setup, mock_db):
    mock_db.repos['mock_user'].insert_one(
        {"name": "last_update", "total_repos": 10, "timestamp": time()})
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
    mocker.patch('gitulyse_api.repos.Github', return_value=github_client_mock)

    response = client.get("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    assert response.status_code == 200
    assert response.json == {"repos": [{"commit_count": 0, "name": "mock_user/test_repo1"}]}
