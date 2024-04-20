import BaseInfo from "@/components/user/BaseInfo";
import { Box, Center, Title } from "@mantine/core";
import RepoList from "@/components/user/RepoList";
import { useEffect, useState } from "react";
import ContributionChart from "@/components/user/ContributionChart";
import { getRepoData } from "@/components/user/utils";
import ExtraUserInfo from "@/components/user/ExtraUserInfo";

const SingleUserCompare = ({ position, userInfo, chartData, largest }) => {
    const [repoData, setRepoData] = useState({});

    useEffect(() => {
        if (Object.keys(userInfo).length === 0 || Object.keys(repoData).length !== 0) return;

        const setInfo = () => {
            setRepoData(getRepoData(userInfo.repo_contributions));
        };

        setInfo();
    }, [repoData, userInfo]);

    return (
        <Box
            className={`flex-1 ${position === "left" && "pr-7"} ${position === "right" && "pl-7"}`}
        >
            <BaseInfo userInfo={userInfo} />

            <ContributionChart
                data={chartData.chartData}
                largest={largest}
                userInfo={userInfo}
                singleUser={true}
            />

            <ExtraUserInfo chartData={chartData} userInfo={userInfo} />

            <Center className="pb-5 mt-4">
                <Title order={3}>Repositories</Title>
            </Center>
            <RepoList repos={userInfo.repos} />
        </Box>
    );
};

export default SingleUserCompare;
