"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Box, Center, Container, Grid, LoadingOverlay, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ContributionChart from "@/components/user/ContributionChart";
import BaseInfo from "@/components/user/BaseInfo";
import RepoList from "@/components/user/RepoList";
import { IconArrowRight } from "@tabler/icons-react";
import { getChartData } from "@/components/user/utils";

export default function UserPage({ params }) {
    const user = params.user;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const [userAccessToken, setUserAccessToken] = useState("");
    const [userInfo, setUserInfo] = useState({});
    const [rechartsData, setRechartsData] = useState([]);
    const [largestAverageContributions, setLargestAverageContributions] = useState(0);

    const [isLoading, { close: disableLoading }] = useDisclosure(true);

    const mockData = {
        name: "monalisa octocat",
        login: "octocat",
        avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
        bio: "The GitHub mascot",
        location: "San Francisco",
        repos: [],
        overall_contributions: {},
        repo_contributions: {},
    };

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

    return isLoading ? (
        <Container size="xl">
            <Box pos="relative">
                <LoadingOverlay
                    visible={isLoading}
                    zIndex={1000}
                    overlayProps={{ radius: "sm", blur: 12 }}
                />
                <Stack className="mt-7" gap="xs">
                    <BaseInfo userInfo={mockData} />

                    <ContributionChart data={[]} largest={100} userInfo={mockData} />

                    <Center mt="lg" mb="md">
                        <Title order={3}>Repositories</Title>
                    </Center>
                    <Container size="xl">
                        <Grid gutter="lg" grow>
                            <Grid.Col span={6}>
                                <a
                                    href="https://github.com/octocat/Spoon-Knife"
                                    target="_blank"
                                    className="py-1.5 px-8 w-full h-14 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                                >
                                    octocat/Spoon-Knife
                                    <IconArrowRight stroke={1.5} />
                                </a>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <a
                                    href="https://github.com/octocat/octocat.github.io"
                                    target="_blank"
                                    className="py-1.5 px-8 w-full h-14 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                                >
                                    octocat/octocat.github.io
                                    <IconArrowRight stroke={1.5} />
                                </a>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <a
                                    href="https://github.com/octocat/hello-worId"
                                    target="_blank"
                                    className="py-1.5 px-8 w-full h-14 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                                >
                                    octocat/hello-worId
                                    <IconArrowRight stroke={1.5} />
                                </a>
                            </Grid.Col>
                        </Grid>
                    </Container>
                </Stack>
            </Box>
        </Container>
    ) : (
        <Container size="xl">
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
