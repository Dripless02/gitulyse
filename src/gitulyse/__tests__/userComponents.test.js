import { render, screen } from "@/testing-utils/test-utils";
import "@/testing-utils/resizeObserverMock";
import BaseInfo from "@/components/user/BaseInfo";
import ContributionChart from "@/components/user/ContributionChart";
import CustomChartTooltip from "@/components/user/CustomChartTooltip";
import ExtraUserInfo from "@/components/user/ExtraUserInfo";
import RepoList from "@/components/user/RepoList";

describe("BaseInfo Component", () => {
    test("renders the component", () => {
        const userInfo = {
            name: "mock_user",
            avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
            login: "mock_user",
            bio: "mock_bio",
            location: "mock_location",
        };

        render(<BaseInfo userInfo={userInfo} />);
        expect(screen.getByText("mock_bio")).toBeInTheDocument();
    });
});

describe("ContributionChart Component", () => {
    test("renders the component", async () => {
        const data = [
            {
                date: "2021-01",
                overall: 10,
                "mock_user/test_repo1": 10,
            },
            {
                date: "2021-02",
                overall: 20,
                "mock_user/test_repo1": 10,
                "mock_user/test_repo2": 10,
            },
        ];

        const largest = 20;

        const userInfo = {
            name: "mock_user",
            avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
            login: "mock_user",
            bio: "mock_bio",
            location: "mock_location",
            repos: [
                {
                    name: "mock_user/test_repo1",
                    commit_count: 20,
                },
                {
                    name: "mock_user/test_repo2",
                    commit_count: 10,
                },
            ],
        };

        render(<ContributionChart data={data} largest={largest} userInfo={userInfo} />);
        expect(screen.getByTestId("contrib-chart")).toBeInTheDocument();
    });
});

describe("CustomChartTooltip Component", () => {
    test("renders the component", () => {
        const payload = [
            {
                stroke: "#8884d8",
                strokeWidth: 1,
                fill: "#fff",
                dataKey: "overall",
                name: "overall",
                color: "#8884d8",
                value: 10,
                payload: {
                    name: "2021-01",
                    overall: 10,
                    "adrian-irwin/gitulyse": 10,
                },
                hide: false,
            },
            {
                stroke: "#FF0000",
                strokeWidth: 1,
                fill: "#fff",
                dataKey: "mock_user/test_repo1",
                name: "mock_user/test_repo1",
                color: "#FF0000",
                value: 10,
                payload: {
                    name: "2021-01",
                    overall: 10,
                    "mock_user/test_repo1": 10,
                },
                hide: false,
            },
        ];

        const active = true;

        const label = "2021-01";

        render(<CustomChartTooltip payload={payload} active={active} label={label} />);
        expect(screen.getByText(/mock_user\/test_repo1/i)).toBeInTheDocument();
    });
});

describe("ExtraUserInfo Component", () => {
    test("renders the component", () => {
        const userInfo = {
            name: "mock_user",
            avatar_url: "https://avatars.githubusercontent.com/u/1?v=4",
            login: "mock_user",
            bio: "mock_bio",
            location: "mock_location",
            repos: [
                {
                    name: "mock_user/test_repo1",
                    commit_count: 20,
                },
                {
                    name: "mock_user/test_repo2",
                    commit_count: 10,
                },
            ],
            overall_contributions: 30,
        };

        const chartData = {
            largest: 20,
        };

        render(<ExtraUserInfo userInfo={userInfo} chartData={chartData} />);
        expect(screen.getByText(/Number of Repositories:[ ]+2/i)).toBeInTheDocument();
    });
});

describe("RepoList Component", () => {
    test("renders the component", () => {
        const repos = [
            {
                name: "mock_user/test_repo1",
                commit_count: 20,
            },
            {
                name: "mock_user/test_repo2",
                commit_count: 10,
            },
        ];

        render(<RepoList repos={repos} />);
        expect(screen.getByText(/mock_user\/test_repo1/i)).toBeInTheDocument();
    });
});
