import { render} from "@testing-library/react";
import Page from "@/app/page";
import "./resizeObserverMock";
import { useSession} from 'next-auth/react';
// https://github.com/plouc/nivo/issues/2310


jest.mock("next-auth/react", () => ({
    useSession: jest.fn(),
    getSession: jest.fn(),
}));

describe("Home Component", () => {
    test("renders correctly when user is authenticated", () => {
        // Mocking authenticated session status
        const mockSession = { data: { status: "authenticated" } };
        useSession.mockReturnValueOnce(mockSession);
        render(<Page />);
    });

    test("renders correctly when user is not authenticated", () => {
        // Mocking unauthenticated session status
        const mockSession = { data: { status: "loading" } };
        useSession.mockReturnValueOnce(mockSession);
        render(<Page />);
    });
});
