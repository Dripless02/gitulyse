from datetime import datetime

from github import Github, StatsContributor, BadCredentialsException
from github.StatsContributor import StatsContributor

from gitulyse_api.commits import parse_contributions


def test_code_contribution_stats(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    repo_mock = mocker.Mock()
    repo_mock.full_name = "mock_user/test_repo"

    repo_mock.get_stats_contributors.return_value = [
        mocker.Mock(spec=StatsContributor,
                    weeks=[
                        mocker.Mock(w=datetime.fromtimestamp(1704067200), a=1, d=0, c=1),
                        mocker.Mock(w=datetime.fromtimestamp(1704672000), a=0, d=0, c=0),
                        mocker.Mock(w=datetime.fromtimestamp(1705276800), a=107, d=0, c=2),
                        mocker.Mock(w=datetime.fromtimestamp(1705881600), a=1960, d=130, c=5),
                        mocker.Mock(w=datetime.fromtimestamp(1706486400), a=0, d=0, c=0),
                        mocker.Mock(w=datetime.fromtimestamp(1707696000), a=200, d=20, c=3),
                        mocker.Mock(w=datetime.fromtimestamp(1708300800), a=50, d=0, c=2),
                        mocker.Mock(w=datetime.fromtimestamp(1708905600), a=10, d=1, c=1),
                    ],
                    author=mocker.Mock(
                        login="mock_user",
                        id=12345678,
                        url="https://api.github.com/users/mock_user",
                    ),
                    total=11,
                    ),
        mocker.Mock(spec=StatsContributor,
                    weeks=[
                        mocker.Mock(w=datetime.fromtimestamp(1704067200), a=540, d=190, c=5),
                        mocker.Mock(w=datetime.fromtimestamp(1704672000), a=0, d=0, c=0),
                        mocker.Mock(w=datetime.fromtimestamp(1705276800), a=123, d=21, c=2),
                        mocker.Mock(w=datetime.fromtimestamp(1705881600), a=1, d=0, c=1),
                        mocker.Mock(w=datetime.fromtimestamp(1706486400), a=0, d=0, c=0),
                        mocker.Mock(w=datetime.fromtimestamp(1707696000), a=0, d=0, c=0),
                        mocker.Mock(w=datetime.fromtimestamp(1708300800), a=0, d=0, c=0),
                        mocker.Mock(w=datetime.fromtimestamp(1708905600), a=0, d=0, c=0),
                    ],
                    author=mocker.Mock(
                        login="mock_user2",
                        id=12345678,
                        url="https://api.github.com/users/mock_user2",
                    ),
                    total=8,
                    ),
    ]

    github_client_mock.get_repo.return_value = repo_mock
    mocker.patch("gitulyse_api.commits.Github", return_value=github_client_mock)

    response = client.get(
        "/code-contribution-stats?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
    )
    assert response.status_code == 200
    assert response.json == {
        "monthly": {
            "2024-01": {
                "mock_user": 2084.2,
                "mock_user2": 690.4
            },
            "2024-02": {
                "mock_user": 263.5,
                "mock_user2": 0
            }
        }
    }


def test_code_contribution_stats_incorrect_token(client, mocker):
    github_client_mock = mocker.Mock(spec=Github)
    github_client_mock.get_repo.side_effect = BadCredentialsException(status=401)
    mocker.patch("gitulyse_api.users.Github", return_value=github_client_mock)

    response = client.get(
        "/code-contribution-stats?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo")
    assert response.status_code == 401
    assert response.json == {"message": "Invalid token"}


def test_code_contributions_no_owner(client):
    response = client.get("/code-contribution-stats?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&repo=test_repo")
    assert response.status_code == 400
    assert response.json == {"message": "No owner provided"}


def test_code_contributions_no_repo(client):
    response = client.get("/code-contribution-stats?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user")
    assert response.status_code == 400
    assert response.json == {"message": "No repo provided"}


def test_parse_contributions_single_user(mocker):
    contributor = mocker.Mock(
        spec=StatsContributor,
        author=mocker.Mock(
            login="mock_user",
            id=12345678,
            url="https://api.github.com/users/mock_user",
        ),
        total=11,
        weeks=[
            mocker.Mock(w=datetime.fromtimestamp(1704067200), a=1, d=0, c=1),
            mocker.Mock(w=datetime.fromtimestamp(1704672000), a=0, d=0, c=0),
            mocker.Mock(w=datetime.fromtimestamp(1705276800), a=107, d=0, c=2),
            mocker.Mock(w=datetime.fromtimestamp(1705881600), a=1960, d=130, c=5),
            mocker.Mock(w=datetime.fromtimestamp(1706486400), a=0, d=0, c=0),
            mocker.Mock(w=datetime.fromtimestamp(1707696000), a=200, d=20, c=3),
            mocker.Mock(w=datetime.fromtimestamp(1708300800), a=50, d=0, c=2),
            mocker.Mock(w=datetime.fromtimestamp(1708905600), a=10, d=1, c=1),
        ],
    )

    contributions = {
        "2024-01": {"additions": 0, "deletions": 0, "commits": 0},
        "2024-02": {"additions": 0, "deletions": 0, "commits": 0},
    }

    result = parse_contributions(contributor, contributions, True)

    assert result == {
        "2024-01": {"additions": 2068, "deletions": 130, "commits": 8},
        "2024-02": {"additions": 260, "deletions": 21, "commits": 6}
    }
