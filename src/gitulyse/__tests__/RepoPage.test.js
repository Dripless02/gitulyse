import "@/testing-utils/resizeObserverMock";
import { render, screen, waitFor } from "@/testing-utils/test-utils";
import { getSession, useSession } from "next-auth/react";
import RepoPage from "@/app/repo/[owner]/[repo]/page";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

jest.mock("d3", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("react-dnd", () => ({
    __esModule: true,
    default: jest.fn(),
    DndProvider: jest.fn().mockImplementation(({ children }) => children || <div />),
    useDrag: jest.fn().mockImplementation(() => [jest.fn(), jest.fn(), jest.fn()]),
    useDrop: jest.fn().mockImplementation(() => [jest.fn(), jest.fn(), jest.fn()]),
}));

jest.mock("react-dnd-html5-backend", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
    useSession: jest.fn(),
    getSession: jest.fn(),
}));

describe("RepoPage Component", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        global.fetch = jest.fn();

        getSession.mockResolvedValue({
            accessToken: "gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            user: {
                name: "mock_user name",
                email: "mock_user@test.com",
                image: "https://avatars.githubusercontent.com/u/38259057?v=4",
            },
            login: "mock_user",
        });
    });

    test("renders correctly", async () => {
        jest.spyOn(global, "fetch").mockImplementationOnce((url) => {
            if (
                url.endsWith(
                    "/get-repo-stats?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo1",
                )
            ) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            contributors: [
                                {
                                    contributions: 10,
                                    login: "mock_user",
                                },
                            ],
                            forks: 0,
                            languages: {
                                CSS: 50,
                                HTML: 200,
                                JavaScript: 100,
                            },
                            open_pull_requests: 0,
                            pull_requests: 9,
                            size: 220,
                            stars: 0,
                            watchers: 0,
                        }),
                });
            }
        });

        useSession.mockReturnValue({ status: "authenticated" });

        render(
            <DndProvider backend={HTML5Backend}>
                <RepoPage params={{ owner: "mock_user", repo: "test_repo1" }} />
            </DndProvider>,
        );

        await waitFor(() => {
            expect(screen.getByText(/mock_user\/test_repo1/i)).toBeInTheDocument();
        });
    });
});
