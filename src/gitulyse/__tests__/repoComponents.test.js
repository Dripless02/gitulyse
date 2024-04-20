import React from "react";
import { render, screen, waitFor } from "@/testing-utils/test-utils";
import CodeContributions from "@/components/repo/CodeContributions";
import IssueTracking from "@/components/repo/IssueTracking";
import PullRequests from "@/components/repo/PullRequests";
import PercentagePullrequests from "@/components/repo/PercentagePullrequests";
import PercentageIssues from "@/components/repo/PercentageIssues";

jest.mock("d3", () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe("CodeContributions Components", () => {
    test("renders the component", () => {
        render(<CodeContributions />);
        expect(screen.getByText("Code Contributions per Month")).toBeInTheDocument();
    });
});

describe("IssueTracking Components", () => {
    test("renders the component", () => {
        render(<IssueTracking />);
        expect(screen.getByText("Issue Tracking")).toBeInTheDocument();
    });
});

describe("PullRequests Components", () => {
    test("renders the component", () => {
        render(<PullRequests />);
        expect(screen.getByText("Time to Merge Pull requests")).toBeInTheDocument();
    });

    test("fetches data", async () => {
        global.fetch = jest.fn();

        jest.spyOn(global, "fetch").mockImplementation((url) => {
            if (
                url.endsWith(
                    "/get-pull-requests?token=gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&owner=mock_user&repo=test_repo1",
                )
            ) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            pullRequests: [
                                {
                                    author: "mock_user",
                                    created_at: "Mon, 01 Jan 2024 00:00:50 GMT",
                                    merged_at: "Mon, 01 Jan 2024 00:00:33 GMT",
                                    pr_number: 1,
                                    state: "merged",
                                    time_to_merge: {
                                        days: 0,
                                        hours: 0,
                                        minutes: 0,
                                        seconds: 33,
                                        total_seconds: 33,
                                    },
                                    title: "test pr",
                                    updated_pr: "Mon, 01 Jan 2024 00:00:33 GMT",
                                },
                            ],
                        }),
                });
            }
        });

        render(
            <PullRequests
                userAccessToken="gho_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                owner="mock_user"
                repo="test_repo1"
            />,
        );

        await waitFor(() => {
            expect(screen.getByText("Time to Merge Pull requests")).toBeInTheDocument();
        });
    });
});

describe("PercentagePullrequests Components", () => {
    test("renders the component", () => {
        render(<PercentagePullrequests />);
        expect(screen.getByText("Percent of PR's merged/created from")).toBeInTheDocument();
    });
});

describe("Percentage Issues Component", () => {
    test("renders the component", () => {
        render(<PercentageIssues />);
        expect(screen.getByText("Percentage of issues resolved/created from")).toBeInTheDocument();
    });
});
