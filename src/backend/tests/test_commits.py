from datetime import datetime

from github import Github, StatsContributor


def test_code_contribution_stats(client, mocker):
    github_client_mock = mocker.MagicMock(spec=Github)
    repo_mock = mocker.MagicMock()
    repo_mock.full_name = "mock_user/test_repo"

    repo_mock.get_stats_contributors.return_value = [
        mocker.MagicMock(spec=StatsContributor,
                         weeks=[
                             mocker.MagicMock(w=datetime.fromtimestamp(1704067200), a=1, d=0, c=1),
                             mocker.MagicMock(w=datetime.fromtimestamp(1704672000), a=0, d=0, c=0),
                             mocker.MagicMock(w=datetime.fromtimestamp(1705276800), a=107, d=0, c=2),
                             mocker.MagicMock(w=datetime.fromtimestamp(1705881600), a=1960, d=130, c=5),
                             mocker.MagicMock(w=datetime.fromtimestamp(1706486400), a=0, d=0, c=0),
                             mocker.MagicMock(w=datetime.fromtimestamp(1707696000), a=200, d=20, c=3),
                             mocker.MagicMock(w=datetime.fromtimestamp(1708300800), a=50, d=0, c=2),
                             mocker.MagicMock(w=datetime.fromtimestamp(1708905600), a=10, d=1, c=1),
                         ],
                         author=mocker.MagicMock(
                             login="mock_user",
                             id=12345678,
                             url="https://api.github.com/users/mock_user",
                         ),
                         total=11,
                         ),
        mocker.MagicMock(spec=StatsContributor,
                         weeks=[
                             mocker.MagicMock(w=datetime.fromtimestamp(1704067200), a=540, d=190, c=5),
                             mocker.MagicMock(w=datetime.fromtimestamp(1704672000), a=0, d=0, c=0),
                             mocker.MagicMock(w=datetime.fromtimestamp(1705276800), a=123, d=21, c=2),
                             mocker.MagicMock(w=datetime.fromtimestamp(1705881600), a=1, d=0, c=1),
                             mocker.MagicMock(w=datetime.fromtimestamp(1706486400), a=0, d=0, c=0),
                             mocker.MagicMock(w=datetime.fromtimestamp(1707696000), a=0, d=0, c=0),
                             mocker.MagicMock(w=datetime.fromtimestamp(1708300800), a=0, d=0, c=0),
                             mocker.MagicMock(w=datetime.fromtimestamp(1708905600), a=0, d=0, c=0),
                         ],
                         author=mocker.MagicMock(
                             login="mock_user2",
                             id=12345678,
                             url="https://api.github.com/users/mock_user2",
                         ),
                         total=8,
                         ),
    ]

    github_client_mock.get_repo.return_value = repo_mock
    mocker.patch('gitulyse_api.commits.Github', return_value=github_client_mock)

    response = client.get(
        "/code-contribution-stats?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo"
    )
    assert response.status_code == 200
    assert response.json == {
        'monthly': {
            '2024-01': {
                'mock_user': 2084.2,
                'mock_user2': 690.4
            },
            '2024-02': {
                'mock_user': 263.5,
                'mock_user2': 0
            }
        }
    }
