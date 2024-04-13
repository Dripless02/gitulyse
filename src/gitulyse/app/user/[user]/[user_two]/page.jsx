"use client";
import BaseInfo from "@/components/user/BaseInfo";
import ContributionChart from "@/components/user/ContributionChart";
import RepoList from "@/components/user/RepoList";
import { getChartData } from "@/components/user/utils";
import { Box, Center, Divider, LoadingOverlay, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

const UserComparePage = ({ params }) => {
    const { user: user_one, user_two } = params;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const [userAccessToken, setUserAccessToken] = useState("");
    const [userOneInfo, setUserOneInfo] = useState({});
    const [userTwoInfo, setUserTwoInfo] = useState({});
    const [userOneRechartsData, setUserOneRechartsData] = useState([]);
    const [userTwoRechartsData, setUserTwoRechartsData] = useState([]);
    const [userOneLargestAverageContributions, setUserOneLargestAverageContributions] = useState(0);
    const [userTwoLargestAverageContributions, setUserTwoLargestAverageContributions] = useState(0);

    const [isLoadingUserOne, { close: disableLoadingUserOne }] = useDisclosure(true);
    const [isLoadingUserTwo, { close: disableLoadingUserTwo }] = useDisclosure(true);
    const [overallLoading, setOverallLoading] = useState(true);

    useEffect(() => {
        async function getInfo() {
            const info = await getSession();
            if (info) {
                setUserAccessToken(info.accessToken);
            }
        }

        getInfo().catch((err) => {
            console.error(err);
        });
    }, []);

    useEffect(() => {
        if (!userAccessToken) return;

        fetch(`${BACKEND_URL}/get-user?token=${userAccessToken}&user=${user_one}`)
            .then((res) => res.json())
            .then((data) => {
                setUserOneInfo(data);
                disableLoadingUserOne();
            });

        fetch(`${BACKEND_URL}/get-user?token=${userAccessToken}&user=${user_two}`)
            .then((res) => res.json())
            .then((data) => {
                setUserTwoInfo(data);
                disableLoadingUserTwo();
            });
    }, [
        BACKEND_URL,
        disableLoadingUserOne,
        disableLoadingUserTwo,
        userAccessToken,
        user_one,
        user_two,
    ]);

    useEffect(() => {
        if (!userOneInfo || !userTwoInfo) return;

        const userOneData = getChartData(
            userOneInfo.overall_contributions,
            userOneInfo.repo_contributions,
        );
        setUserOneRechartsData(userOneData.newRechartsData);
        setUserOneLargestAverageContributions(userOneData.largest);

        const userTwoData = getChartData(
            userTwoInfo.overall_contributions,
            userTwoInfo.repo_contributions,
        );
        setUserTwoRechartsData(userTwoData.newRechartsData);
        setUserTwoLargestAverageContributions(userTwoData.largest);
    }, [userOneInfo, userTwoInfo]);

    useEffect(() => {
        if (!isLoadingUserOne && !isLoadingUserTwo) {
            setOverallLoading(false);
        }
    }, [isLoadingUserOne, isLoadingUserTwo]);

    return (
        <Box className="max-w-full mt-6" pos="relative">
            <LoadingOverlay
                visible={overallLoading}
                zIndex={1000}
                overlayProps={{ radius: "sm", blur: 12 }}
            />
            <Center className="pb-5">
                <Title order={1}>
                    Comparison between &apos;{user_one}&apos; and &apos;{user_two}&apos;
                </Title>
            </Center>

            <Box className="flex flex-row justify-center">
                <Box className="flex-1 pr-2" pos="relative">
                    <BaseInfo userInfo={userOneInfo} />

                    <ContributionChart
                        data={userOneRechartsData}
                        largest={userOneLargestAverageContributions}
                        userInfo={userOneInfo}
                        singleUser={true}
                    />

                    <Center className="pb-5">
                        <Title order={3}>Repositories</Title>
                    </Center>
                    <RepoList repos={userOneInfo.repos} />
                </Box>

                <Divider orientation="vertical" size="xl" />

                <Box className="flex-1 pl-2" pos="relative">
                    <BaseInfo userInfo={userTwoInfo} />

                    <ContributionChart
                        data={userTwoRechartsData}
                        largest={userTwoLargestAverageContributions}
                        userInfo={userTwoInfo}
                        singleUser={true}
                    />

                    <Center className="pb-5">
                        <Title order={3}>Repositories</Title>
                    </Center>
                    <RepoList repos={userTwoInfo.repos} />
                </Box>
            </Box>
        </Box>
    );
};

export default UserComparePage;
