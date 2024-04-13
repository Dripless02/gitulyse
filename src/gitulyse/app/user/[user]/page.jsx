"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Center, Container, LoadingOverlay, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ContributionChart from "@/components/user/ContributionChart";
import BaseInfo from "@/components/user/BaseInfo";
import RepoList from "@/components/user/RepoList";
import { getChartData } from "@/components/user/utils";

export default function UserPage({ params }) {
    const user = params.user;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const [userAccessToken, setUserAccessToken] = useState("");
    const [userInfo, setUserInfo] = useState({});
    const [rechartsData, setRechartsData] = useState([]);
    const [largestAverageContributions, setLargestAverageContributions] = useState(0);

    const [isLoading, { close: disableLoading }] = useDisclosure(true);

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

        fetch(`${BACKEND_URL}/get-user?token=${userAccessToken}&user=${user}`)
            .then((res) => res.json())
            .then((data) => {
                setUserInfo(data);
                disableLoading();
            });
    }, [BACKEND_URL, disableLoading, user, userAccessToken]);

    useEffect(() => {
        if (Object.keys(userInfo).length === 0 || rechartsData.length !== 0) return;

        const setInfo = () => {
            const newRechartsData = getChartData(
                userInfo.overall_contributions,
                userInfo.repo_contributions,
            );

            setRechartsData(newRechartsData.newRechartsData);
            setLargestAverageContributions(newRechartsData.largest);
        };

        setInfo();
    }, [rechartsData.length, userInfo]);

    return (
        <Container size="xl" pos="relative">
            <LoadingOverlay
                visible={isLoading}
                zIndex={1000}
                overlayProps={{ radius: "sm", blur: 12 }}
            />
            <Stack className="mt-7" gap="xs" align="stretch" justify="space-between">
                <BaseInfo userInfo={userInfo} />

                <ContributionChart
                    data={rechartsData}
                    largest={largestAverageContributions}
                    userInfo={userInfo}
                />

                <Center mt="lg" mb="md">
                    <Title order={3}>Repositories</Title>
                </Center>
                <RepoList repos={userInfo.repos} />
            </Stack>
        </Container>
    );
}
