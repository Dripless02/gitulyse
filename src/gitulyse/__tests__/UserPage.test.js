import { render, screen, waitFor } from "@/testing-utils/test-utils";
import "@/testing-utils/resizeObserverMock";
import UserPage from "@/app/user/[user]/page";
import { getSession } from "next-auth/react";

jest.mock("next-auth/react", () => ({
    useSession: jest.fn(),
    getSession: jest.fn(),
}));

describe("UserPage Component", () => {
    test("renders correctly", async () => {
        getSession.mockResolvedValueOnce({
            accessToken: "gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            user: {
                name: "mock_user name",
                email: "mock_user@test.com",
                image: "https://avatars.githubusercontent.com/u/38259057?v=4",
            },
            login: "mock_user",
        });

        global.fetch = jest.fn();

        jest.spyOn(global, "fetch").mockImplementation((url) => {
            if (
                url.endsWith(
                    "get-user?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&user=mock_user",
                )
            ) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            avatar_url: "https://avatars.githubusercontent.com/u/38259057?v=4",
                            bio: "mock_bio",
                            created_at: "2021-01-01T00:00:00Z",
                            email: "mock_user@test.com",
                            html_url: "",
                            languages: {
                                C: 1000,
                                Java: 2000,
                                JavaScript: 3000,
                                Python: 4000,
                            },
                            location: "mock_location",
                            login: "mock_user",
                            name: "mock_user name",
                            overall_contributions: {
                                "2022-01": {
                                    additions: 100,
                                    deletions: 100,
                                    commits: 10,
                                },
                                "2022-02": {
                                    additions: 200,
                                    deletions: 200,
                                    commits: 20,
                                },
                            },
                            public_repo_count: 2,
                            pull_request_count: 2,
                            repo_contributions: {
                                "mock_user/test_repo1": {
                                    "2022-01": {
                                        additions: 50,
                                        deletions: 50,
                                        commits: 5,
                                    },
                                    "2022-02": {
                                        additions: 100,
                                        deletions: 100,
                                        commits: 10,
                                    },
                                },
                                "mock_user/test_repo2": {
                                    "2022-01": {
                                        additions: 50,
                                        deletions: 50,
                                        commits: 5,
                                    },
                                    "2022-02": {
                                        additions: 100,
                                        deletions: 100,
                                        commits: 10,
                                    },
                                },
                            },
                            repos: [
                                {
                                    name: "mock_user/test_repo1",
                                    html_url: "",
                                },
                                {
                                    name: "mock_user/test_repo2",
                                    html_url: "",
                                },
                            ],
                            timestamp: 1713529089.7184265,
                        }),
                });
            }
        });

        render(<UserPage params={{ user: "mock_user" }} />);
        await waitFor(() => {
            expect(screen.getByText("mock_user")).toBeInTheDocument();
        });
    });
});
