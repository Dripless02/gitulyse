import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Nav from "@/components/Nav";
import { useSession, signIn, signOut, getSession } from "next-auth/react";
import { useRouter } from "next/router";

// Mock useRouter to provide a minimal router object
jest.mock("next/router", () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
    }),
}));

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

    test("calls sign out function when sign out button is clicked", () => {
        useSession.mockReturnValueOnce({
            data: {
                user: {
                    name: "test",
                    email: "test@test.com",
                    image: "https://avatars.githubusercontent.com/u/583231?v=4",
                },
            },
            status: "authenticated",
        });
        render(<Nav />);
        expect(screen.getByText("Sign Out")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Sign Out"));
        expect(signOut).toHaveBeenCalled();
    });

    test('toggles modal when "How?" button is clicked', () => {
        useSession.mockReturnValue({
            data: {
                user: {
                    name: "test",
                    email: "test@test.com",
                    image: "https://avatars.githubusercontent.com/u/583231?v=4",
                },
            },
            status: "authenticated",
        });
        render(<Nav />);
        fireEvent.click(screen.getByText("How?"));
    });
});
