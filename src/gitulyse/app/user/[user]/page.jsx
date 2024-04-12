"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Box, Center, Container, Grid, LoadingOverlay, Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ContributionChart from "@/components/user/ContributionChart";
import BaseInfo from "@/components/user/BaseInfo";
import RepoList from "@/components/user/RepoList";
import { usePathname } from "next/navigation";
import { IconArrowRight } from "@tabler/icons-react";

export default function UserPage({ params }) {
    const user = params.user;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const [userAccessToken, setUserAccessToken] = useState("");
    const [userInfo, setUserInfo] = useState({});
    const [rechartsData, setRechartsData] = useState([]);
    const [largestAverageContributions, setLargestAverageContributions] = useState(0);
    const [singleUser, setSingleUser] = useState(false);
    const pathname = usePathname();

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
        if ((pathname.match(/\//g) || []).length === 3) {
            setSingleUser(false);
        } else if ((pathname.match(/\//g) || []).length === 2) {
            setSingleUser(true);
        }
    }, [pathname]);

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
        let largest = 0;

        const setInfo = () => {
            const overallContributions = userInfo.overall_contributions;
            const repoContributions = userInfo.repo_contributions;

            const newRechartsData = [];

            for (const month in overallContributions) {
                const month_info = {
                    name: month,
                    overall: 0,
                };

                let average_contributions_per_commit =
                    overallContributions[month]["additions"] +
                    overallContributions[month]["deletions"] /
                        overallContributions[month]["commits"];
                average_contributions_per_commit = Number(
                    average_contributions_per_commit.toFixed(1),
                );

                if (isNaN(average_contributions_per_commit)) {
                    average_contributions_per_commit = "0";
                }
                month_info["overall"] = average_contributions_per_commit;

                if (largest < average_contributions_per_commit) {
                    largest = average_contributions_per_commit;
                }

                for (const repo in repoContributions) {
                    let data = repoContributions[repo][month];
                    let average_contributions_per_commit;
                    if (!data) {
                        month_info[repo] = null;
                        continue;
                    }

                    average_contributions_per_commit =
                        data["additions"] + data["deletions"] / data["commits"];
                    average_contributions_per_commit = Number(
                        average_contributions_per_commit.toFixed(1),
                    );

                    if (isNaN(average_contributions_per_commit)) {
                        average_contributions_per_commit = 0;
                    }

                    month_info[repo] = average_contributions_per_commit;

                    if (largest < average_contributions_per_commit) {
                        largest = average_contributions_per_commit;
                    }
                }
                newRechartsData.push(month_info);
            }

            setRechartsData(newRechartsData);
            setLargestAverageContributions(largest);
        };

        setInfo();
    }, [rechartsData.length, userInfo]);

    return isLoading ? (
        <Container size={singleUser ? "xl" : "55rem"}>
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
        <Container size={singleUser ? "xl" : "55rem"} m={0}>
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
