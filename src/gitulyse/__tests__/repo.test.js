import { render, screen, waitFor } from "@/testing-utils/test-utils";
import Repos from "@/components/Repos";
import { getSession, useSession } from "next-auth/react";

jest.mock("next-auth/react");
jest.mock("react-google-charts", () => {
    return {
        Chart: ({ data }) => {
            return <div data-testid="chart">{data}</div>;
        },
    };
});
describe("Repos Component", () => {
    beforeEach(() => {
        // https://github.com/nextauthjs/next-auth/discussions/4185#discussioncomment-8576643
        const useSessionMocked = jest.mocked(useSession);

        useSessionMocked.mockReturnValue({
            data: {
                user: {
                    name: "mock_user",
                },
                expires: new Date(Date.now() + 2 * 86400).toISOString(),
            },
            status: "authenticated",
            update: jest.fn(),
        });
        const getSessionMocked = jest.mocked(getSession);

        getSessionMocked.mockReturnValue({
            user: {
                name: "mock_user",
            },
            expires: new Date(Date.now() + 2 * 86400).toISOString(),
            accessToken: "gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            login: "mock_user",
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders correctly", async () => {
        global.fetch = jest.fn();

        jest.spyOn(global, "fetch").mockImplementation((url) => {
            if (url.endsWith("/get-repos?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&limit=6")) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            repos: [
                                { commit_count: 10, name: "mock_user/test_repo1" },
                                {
                                    commit_count: 20,
                                    name: "mock_user/test_repo2",
                                },
                            ],
                        }),
                });
            }
        });

        render(<Repos />);
        await waitFor(() => {
            expect(screen.getByText("Your Recently Updated Repos")).toBeInTheDocument();
            expect(getSession).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId("chart")).toBeInTheDocument();
            expect(screen.getByText(/mock_user\/test_repo1/i)).toBeInTheDocument();
        });
    });
});
