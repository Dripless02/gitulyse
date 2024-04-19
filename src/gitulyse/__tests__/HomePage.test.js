import { render, screen, waitFor } from "@/testing-utils/test-utils";
import "@/testing-utils/resizeObserverMock";
import Home from "@/app/page";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react", () => ({
    useSession: jest.fn(),
    getSession: jest.fn(),
}));

describe("Home Component", () => {
    test("renders correctly when user is authenticated", async () => {
        // Mocking authenticated session status
        const mockSession = { status: "authenticated" };
        useSession.mockReturnValueOnce(mockSession);
        render(<Home />);

        // https://stackoverflow.com/a/68331605
        await waitFor(() => {
            expect(screen.getByText("Your Recently Updated Repos")).toBeInTheDocument();
        });
    });

    test("renders correctly when user is not authenticated", () => {
        // Mocking unauthenticated session status
        const mockSession = { status: "loading" };
        useSession.mockReturnValueOnce(mockSession);
        render(<Home />);
        expect(
            screen.getAllByText("Gitulyse, Analyse your Git Repositories.")[0],
        ).toBeInTheDocument();
        expect(
            screen.getAllByText("Search for a repository or user, and view their workflow.")[0],
        ).toBeInTheDocument();
        expect(
            screen.getAllByText("Sign in with your Github to get started.")[0],
        ).toBeInTheDocument();
    });
});
