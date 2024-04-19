import GitTimeline from "@/components/GitTimeline";
import { render, screen, waitFor } from "@/testing-utils/test-utils";

describe("GitTimeline Component", () => {
    test("renders correctly", async () => {
        global.fetch = jest.fn();

        jest.spyOn(global, "fetch").mockImplementation((url) => {
            if (
                url.endsWith(
                    "/github-activity-day?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=mock_user&date=2024-01-01",
                )
            ) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve([
                            {
                                repo: "mock_user/test_repo1",
                                type: "DeleteEvent",
                                created_at: "2024-01-01T00:00:00Z",
                                payload: {
                                    ref: "refs/heads/main",
                                    ref_type: "branch",
                                },
                            },
                            {
                                repo: "mock_user/test_repo2",
                                type: "PushEvent",
                                created_at: "2024-01-01T01:00:00Z",
                                payload: {
                                    before: 123456,
                                    commits: [
                                        {
                                            author: {
                                                email: "mock_user@test.com",
                                                name: "mock_user",
                                            },
                                            distinct: true,
                                            message: "mock commit message",
                                            sha: 654321,
                                            url: "https://api.github.com/repos/mock_user/test_repo1/commit/654321",
                                        },
                                    ],
                                    distinct_size: 1,
                                    head: 654321,
                                    push_id: 123456789,
                                    ref: "refs/heads/main",
                                    repository_id: 123654,
                                    size: 1,
                                },
                            },
                            {
                                created_at: "2024-01-01T02:00:00Z",
                                payload: {
                                    description: "mock description",
                                    master_branch: "dev",
                                    pusher_type: "user",
                                    ref: "main",
                                    ref_type: "branch",
                                },
                                type: "CreateEvent",
                            },
                            {
                                repo: "mock_user/test_repo2",
                                type: "PullRequestEvent",
                                created_at: "2024-01-01T03:00:00Z",
                                payload: {
                                    action: "opened",
                                    number: 123,
                                    pull_request: {
                                        url: "https://api.github.com/repos/mock_user/test_repo2/pulls/123",
                                    },
                                },
                            },
                            {
                                type: "WatchEvent",
                                created_at: "2024-01-01T04:00:00Z",
                                payload: {
                                    action: "started",
                                },
                                repo: "other_mock_user/test_repo2",
                            },
                            {
                                repo: "other_mock_user/test_repo3",
                                type: "ForkEvent",
                                created_at: "2024-01-01T05:00:00Z",
                                payload: {
                                    forkee: {
                                        full_name: "mock_user/test_repo3",
                                    },
                                },
                            },
                            {
                                type: "PublicEvent",
                                created_at: "2024-01-01T06:00:00Z",
                                repo: "mock_user/test_repo4",
                            },
                            {
                                type: "OtherEvent",
                                created_at: "2024-01-01T07:00:00Z",
                            },
                        ]),
                });
            }
        });

        render(
            <GitTimeline
                userAccessToken="gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                user="mock_user"
                date="2024-01-01"
            />,
        );
        await waitFor(() => {
            expect(screen.getByText("mock_user/test_repo1")).toBeInTheDocument();
        });
    });
});
