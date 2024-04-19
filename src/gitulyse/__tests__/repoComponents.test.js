import React from "react";
import { render, screen } from "@/testing-utils/test-utils";
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
