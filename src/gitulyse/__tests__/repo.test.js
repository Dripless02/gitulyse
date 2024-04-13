import { render, screen } from "@testing-library/react";
import Repos from "@/components/Repos";
import mockRouter from "next-router-mock";
import { getSession } from "next-auth/react";
import { Chart } from "react-google-charts";
import { useRouter } from "next/router";

jest.mock("next/navigation", () => jest.requireActual("next-router-mock"));

jest.mock("next-auth/react", () => ({
    getSession: jest.fn(),
}));

jest.mock("react-google-charts", () => ({
    Chart: jest.fn(() => null),
}));

describe("Repos Component", () => {
    beforeEach(() => {
        mockRouter.push("/repos");
        getSession.mockResolvedValue({ accessToken: "mockAccessToken" }); //
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders without crashing", () => {
        render(<Repos />);
    });

    test("fetches user session on mount", async () => {
        render(<Repos />);
        expect(getSession).toHaveBeenCalled();
        expect(getSession).toHaveBeenCalledTimes(1);
    });

    // test("fetches repositories after getting user session", async () => {
    //     render(<Repos />);
    //     expect(fetch).toHaveBeenCalledWith(
    //         expect.stringContaining("get-repos?token=mockAccessToken&limit=6"),
    //     );
    // });

});
//     test("renders Chart component with correct data", async () => {
//         const mockRepos = [
//             { name: "repo1", commit_count: 10 },
//             { name: "repo2", commit_count: 20 },
//         ];
//         fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ repos: mockRepos }) });

//         render(<Repos />);
//         expect(Chart).toHaveBeenCalledWith(
//             expect.objectContaining({
//                 data: [
//                     ["reponame", "commitcount"],
//                     ["repo1", 10],
//                     ["repo2", 20],
//                 ],
//             }),
//             {},
//         );
//     });
// });
