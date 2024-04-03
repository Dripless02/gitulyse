import mongomock
import pytest
from github import Github

from gitulyse_api import create_app
from gitulyse_api.db import get_db


@pytest.fixture
def app(mock_db):
    app = create_app({"TESTING": True, "MOCK_DB": mock_db})

    with app.app_context():
        get_db()

    yield app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()


@pytest.fixture
def mock_db():
    return mongomock.MongoClient()


@pytest.fixture
def repos_setup(request, mock_db, mocker):
    if request.param is None:
        num_user_repos = 2
    else:
        num_user_repos = request.param
    mock_db.repos['mock_user'].insert_many([
        {"name": "mock_user/test_repo1", "commit_count": 10},
        {"name": "mock_user/test_repo2", "commit_count": 20},
    ])
    mock_db.repos['mock_user_2'].insert_many([
        {"name": "mock_user_2/test_repo", "commit_count": 10},
        {"name": "mock_user_2/test_repo2", "commit_count": 20},
    ])

    github_client_mock = mocker.Mock(spec=Github)
    user_mock = mocker.Mock(login="mock_user")
    repos = []
    for i in range(num_user_repos):
        repo_mock = mocker.Mock(full_name=f"mock_user/test_repo{i + 1}")
        repo_mock.get_commits.return_value = mocker.Mock(totalCount=(10 * (i + 1)))
        repos.append(repo_mock)
    user_mock.get_repos.return_value = iter(repos)
    github_client_mock.get_user.return_value = user_mock
    mocker.patch('gitulyse_api.repos.Github', return_value=github_client_mock)
    yield mock_db
