import BaseInfo from "@/components/user/BaseInfo";
import { Box, Center, Title } from "@mantine/core";
import RepoList from "@/components/user/RepoList";
import { useEffect, useState } from "react";
import ContributionChart from "@/components/user/ContributionChart";
import { getRepoData } from "@/components/user/utils";

const SingleUserCompare = ({ position, userInfo, chartData }) => {
    useEffect(() => {
        console.log("chartData", chartData);
    }, [chartData]);

    const [repoData, setRepoData] = useState({});

    useEffect(() => {
        if (Object.keys(userInfo).length === 0 || Object.keys(repoData).length !== 0) return;

        const setInfo = () => {
            setRepoData(getRepoData(userInfo.repo_contributions));
        };

        setInfo();
    }, [repoData, userInfo]);

    useEffect(() => {
        console.log("userInfo", userInfo);
        console.log("chartData", chartData);
        console.log("repoData", repoData);
    }, [userInfo, chartData, repoData]);

    return (
        <Box
            className={`flex-1 ${position === "left" && "pr-2"} ${position === "right" && "pl-2"}`}
        >
            <BaseInfo userInfo={userInfo} />

            <ContributionChart
                data={chartData.chartData}
                largest={chartData.largest?.number || 0}
                userInfo={userInfo}
                singleUser={true}
            />

            <Center className="pb-5 mt-4">
                <Title order={3}>Repositories</Title>
            </Center>
            <RepoList repos={userInfo.repos} />
        </Box>
    );
};

export default SingleUserCompare;
