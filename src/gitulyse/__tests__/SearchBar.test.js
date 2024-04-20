import { getSession } from "next-auth/react";
import SearchBar from "@/components/SearchBar";
import { act, fireEvent, render, screen, waitFor } from "@/testing-utils/test-utils";

jest.mock("next-auth/react", () => ({
    getSession: jest.fn(),
}));

jest.mock("next/navigation", () => jest.requireActual("next-router-mock"));

describe("SearchBar Component", () => {
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

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test("renders correctly", async () => {
        render(
            <SearchBar
                userCompare={[]}
                setUserCompare={() => {}}
                dialogStatus={false}
                dialogOpen={() => {}}
            />,
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Search for a repository/i)).toBeInTheDocument();
        });
    });

    test("searches for repositories correctly", async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                results: ["mock_user/test_repo1", "mock_user/test_repo2", "mock_user/test_repo3"],
            }),
            status: 200,
        });

        render(
            <SearchBar
                userCompare={[]}
                setUserCompare={() => {}}
                dialogStatus={false}
                dialogOpen={() => {}}
            />,
        );

        const input = screen.getByPlaceholderText(/Search for a repository/i);
        fireEvent.change(input, { target: { value: "mock" } });
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        fireEvent.click(input);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Search for a repository/i)).toBeInTheDocument();
            expect(screen.getByText(/mock_user\/test_repo1/i)).toBeInTheDocument();
        });
    });

    test("searches for users correctly", async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({
                results: ["mock_user1", "mock_user2", "mock_user3"],
            }),
            status: 200,
        });

        render(
            <SearchBar
                userCompare={[]}
                setUserCompare={() => {}}
                dialogStatus={false}
                dialogOpen={() => {}}
            />,
        );

        fireEvent.click(screen.getByRole("radio", { name: /user/i }));
        const input = screen.getByPlaceholderText(/Search for a user/i);
        fireEvent.change(input, { target: { value: "mock" } });
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        fireEvent.click(input);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Search for a user/i)).toBeInTheDocument();
            expect(screen.getByText(/mock_user1/i)).toBeInTheDocument();
        });
    });
});
