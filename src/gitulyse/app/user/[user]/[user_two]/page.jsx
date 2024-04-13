"use client";
import { getChartData } from "@/components/user/utils";
import { Box, Center, Divider, LoadingOverlay, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import SingleUserCompare from "@/components/user/SingleUserCompare";

const UserComparePage = ({ params }) => {
    const { user: user_one, user_two } = params;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const [userAccessToken, setUserAccessToken] = useState("");
    const [userOneInfo, setUserOneInfo] = useState({});
    const [userTwoInfo, setUserTwoInfo] = useState({});
    const [userOneChartData, setUserOneChartData] = useState({});
    const [userTwoChartData, setUserTwoChartData] = useState({});

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
        setUserOneChartData(userOneData);

        const userTwoData = getChartData(
            userTwoInfo.overall_contributions,
            userTwoInfo.repo_contributions,
        );
        setUserTwoChartData(userTwoData);
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
                    Comparison of &apos;
                    {userOneInfo.name ? userOneInfo.name : userOneInfo.login}&apos; and &apos;
                    {userTwoInfo.name ? userTwoInfo.name : userTwoInfo.login}&apos;
                </Title>
            </Center>

            <Box className="flex flex-row justify-center">
                <SingleUserCompare
                    userInfo={userOneInfo}
                    chartData={userOneChartData}
                    position="left"
                />

                <Divider orientation="vertical" size="xl" />

                <SingleUserCompare
                    userInfo={userTwoInfo}
                    chartData={userTwoChartData}
                    position="right"
                />
            </Box>
        </Box>
    );
};

export default UserComparePage;
