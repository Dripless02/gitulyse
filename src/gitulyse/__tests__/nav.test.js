import React from "react";
import { fireEvent, render, screen } from "@/testing-utils/test-utils";
import Nav from "@/components/Nav";
import { signIn, useSession } from "next-auth/react";

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
    ...jest.requireActual("next-auth/react"),
    getSession: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn(),
}));

describe("Nav component", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders without crashing", () => {
        useSession.mockReturnValueOnce({ data: null });
        render(<Nav />);
        expect(screen.getByText("Gitulyse")).toBeInTheDocument();
    });

    test("renders sign in button when session is null", () => {
        useSession.mockReturnValueOnce({ data: null });
        render(<Nav />);
        expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    test("calls sign in function when sign in button is clicked", () => {
        useSession.mockReturnValueOnce({ data: null });
        render(<Nav />);
        fireEvent.click(screen.getByText("Sign In"));
        expect(signIn).toHaveBeenCalled();
    });

    // test("calls sign out function when sign out button is clicked", () => {
    //     useSession.mockReturnValueOnce({
    //         status: "authenticated",
    //     });
    //     render(<Nav />);
    //     expect(screen.getByText("Sign Out")).toBeInTheDocument();
    //     fireEvent.click(screen.getByText("Sign Out"));
    //     expect(signOut).toHaveBeenCalled();
    // });

    // test('toggles modal when "How?" button is clicked', () => {
    //     useSession.mockReturnValue({
    //         status: "authenticated",
    //     });
    //     render(<Nav />);
    //     fireEvent.click(screen.getByText("How?"));
    // });
});
