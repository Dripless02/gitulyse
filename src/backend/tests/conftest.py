from datetime import datetime

import mongomock
import pytest
from dateutil.relativedelta import relativedelta
from github import Github, PullRequest, Issue

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


@pytest.fixture
def pull_request_setup(mocker):
    github_client_mock = mocker.Mock(spec=Github)
    repo_mock = mocker.Mock()
    repo_mock.get_pulls.return_value = [
        mocker.Mock(
            spec=PullRequest,
            title="Test Pull Request 1",
            user=mocker.Mock(login="mock_user"),
            created_at=datetime.fromtimestamp(1704067200),
            updated_at=datetime.fromtimestamp(1704153600),
            merged_at=datetime.fromtimestamp(1704153600),
            closed_at=datetime.fromtimestamp(1704153600),
            number=1,
            state="closed",
        ),
        mocker.Mock(
            spec=PullRequest,
            title="Test Pull Request 2",
            user=mocker.Mock(login="mock_user"),
            created_at=datetime.fromtimestamp(1704067200),
            updated_at=datetime.fromtimestamp(1704153600),
            merged_at=None,
            closed_at=datetime.fromtimestamp(1704153600),
            number=2,
            state="closed",
        ),
        mocker.Mock(
            spec=PullRequest,
            title="Test Pull Request 3",
            user=mocker.Mock(login="mock_user"),
            created_at=datetime.fromtimestamp(1704067200),
            updated_at=datetime.fromtimestamp(1704153600),
            merged_at=None,
            closed_at=None,
            number=3,
            state="open",
        ),
    ]

    github_client_mock.get_repo.return_value = repo_mock
    mocker.patch("gitulyse_api.pull_requests.Github", return_value=github_client_mock)


@pytest.fixture
def issues_setup(mocker):
    github_client_mock = mocker.Mock(spec=Github)
    repo_mock = mocker.Mock()
    repo_mock.get_issues.return_value = [
        mocker.Mock(
            spec=Issue,
            title="Test Issue 1",
            user=mocker.Mock(
                login="mock_user"
            ),
            created_at=datetime.fromtimestamp(1704067200),
            updated_at=datetime.fromtimestamp(1704153600),
            number=1,
            closed_at=datetime.fromtimestamp(1704153600),
            state="closed"
        ),
        mocker.Mock(
            spec=Issue,
            title="Test Issue 2",
            user=mocker.Mock(
                login="mock_user"
            ),
            created_at=datetime.fromtimestamp(1704067200),
            updated_at=datetime.fromtimestamp(1704153600),
            number=2,
            closed_at=None,
            state="open"
        ),
    ]
    github_client_mock.get_repo.return_value = repo_mock
    mocker.patch("gitulyse_api.issues.Github", return_value=github_client_mock)


@pytest.fixture
def users_base_setup(mocker):
    github_client_mock = mocker.Mock(spec=Github)
    user_mock = mocker.Mock()
    user_mock.login = "mock_user"
    user_mock.name = "Mock User"
    user_mock.email = "mock_user@test.com"
    user_mock.bio = "Test bio"
    user_mock.location = "Test location"
    user_mock.public_repos = 2
    user_mock.created_at = datetime.strptime("2022-01-01", "%Y-%m-%d")
    user_mock.avatar_url = "https://test.com/avatar"
    user_mock.html_url = "https://github.com/mock_user"
    repo_mock_1 = mocker.Mock(full_name="mock_user/test_repo", html_url="https://github.com/mock_user/test_repo")
    repo_mock_1.get_languages.return_value = {"Python": 100}
    repo_mock_2 = mocker.Mock(full_name="mock_user/test_repo2", html_url="https://github.com/mock_user/test_repo2")
    repo_mock_2.get_languages.return_value = {"Python": 100}
    yield github_client_mock, user_mock, repo_mock_1, repo_mock_2


@pytest.fixture
def users_setup(users_base_setup, mocker):
    github_client_mock, user_mock, repo_mock_1, repo_mock_2 = users_base_setup
    repo_mock_1.get_stats_contributors.return_value = [
        mocker.Mock(weeks=[
            mocker.Mock(w=datetime.strptime("2021-01-01", "%Y-%m-%d"), a=0, d=0, c=0),
            mocker.Mock(w=datetime.strptime("2022-01-01", "%Y-%m-%d"), a=100, d=100, c=10),
            mocker.Mock(w=datetime.strptime("2022-01-08", "%Y-%m-%d"), a=100, d=100, c=10),
        ])
    ]

    repo_mock_2.get_stats_contributors.return_value = [
        mocker.Mock(weeks=[
            mocker.Mock(w=datetime.strptime("2022-01-01", "%Y-%m-%d"), a=100, d=100, c=10),
            mocker.Mock(w=datetime.strptime("2022-01-08", "%Y-%m-%d"), a=100, d=100, c=10),
        ])
    ]

    user_mock.get_repos.return_value = [repo_mock_1, repo_mock_2]
    github_client_mock.get_user.return_value = user_mock
    github_client_mock.search_issues.return_value = [mocker.Mock()]

    mocker.patch("gitulyse_api.users.Github", return_value=github_client_mock)


@pytest.fixture
def users_db_setup(mock_db):
    timestamp = datetime.timestamp(datetime.now() - relativedelta(minutes=5))
    mock_db.users["mock_user"].insert_one({
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
        "timestamp": timestamp
    })
