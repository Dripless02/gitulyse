"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import {
    Avatar,
    Box,
    Center,
    Container,
    Grid,
    Group,
    LoadingOverlay,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { IconArrowRight, IconInfoSquareRounded, IconMapPin } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const getColor = (index) => {
    const colors = [
        "#FF0000", // Red
        "#00FF00", // Green
        "#0000FF", // Blue
        "#FFFF00", // Yellow
        "#FF00FF", // Magenta
        "#00FFFF", // Cyan
        "#FFA500", // Orange
        "#800080", // Purple
        "#008000", // Dark Green
        "#800000", // Maroon
    ];
    return colors[index % colors.length];
};

const customChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip bg-neutral-900/90 p-4">
                <p className="label text-white underline font-bold">{label}</p>
                <ul>
                    {payload.map((entry, index) => {
                        if (entry.dataKey === "overall") {
                            return (
                                <li key={`item-${index}`} style={{ color: entry.color }}>
                                    Overall: {entry.value}
                                </li>
                            );
                        }
                        if (entry.value === 0) {
                            return;
                        }
                        return (
                            <li key={`item-${index}`} style={{ color: entry.color }}>
                                {entry.name}: {entry.value}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
};

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
        <Container size="xl" py="xl">
            <Box pos="relative">
                <LoadingOverlay
                    visible={isLoading}
                    zIndex={1000}
                    overlayProps={{ radius: "sm", blur: 12 }}
                />
                <Stack className="mt-7" gap="xs">
                    <Group justify="space-between" className="mb-4">
                        <div>
                            <Title order={1}>monalisa octocat</Title>
                            <Text c="dimmed">octocat</Text>
                        </div>
                        <Avatar
                            src="https://avatars.githubusercontent.com/u/583231?v=4"
                            alt="monalisa octocat"
                            size="xl"
                        />
                    </Group>
                    <Group>
                        <IconMapPin stroke={1.5} />
                        <Text>San Francisco</Text>
                    </Group>
                    <Center mt="lg" mb="md">
                        <Title order={3}>Repositories</Title>
                    </Center>
                    <Container size="xl">
                        <Grid gutter="lg" grow>
                            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                                <a
                                    href="https://github.com/octocat/Spoon-Knife"
                                    target="_blank"
                                    className="py-1.5 px-8 w-full h-14 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                                >
                                    octocat/Spoon-Knife
                                    <IconArrowRight stroke={1.5} />
                                </a>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                                <a
                                    href="https://github.com/octocat/octocat.github.io"
                                    target="_blank"
                                    className="py-1.5 px-8 w-full h-14 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                                >
                                    octocat/octocat.github.io
                                    <IconArrowRight stroke={1.5} />
                                </a>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                                <a
                                    href="https://github.com/octocat/hello-worId"
                                    target="_blank"
                                    className="py-1.5 px-8 w-full h-14 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                                >
                                    octocat/hello-worId
                                    <IconArrowRight stroke={1.5} />
                                </a>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                                <a
                                    href="https://github.com/octocat/git-consortium"
                                    target="_blank"
                                    className="py-1.5 px-8 w-full h-14 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                                >
                                    octocat/git-consortium
                                    <IconArrowRight stroke={1.5} />
                                </a>
                            </Grid.Col>
                        </Grid>
                    </Container>
                </Stack>
            </Box>
        </Container>
    ) : (
        <Container size="xl" py="xl">
            <Stack className="mt-7" gap="xs">
                <Group justify="space-between" className="mb-4">
                    {userInfo.name ? (
                        <div>
                            <Title order={1}>{userInfo.name}</Title>
                            <Text c="dimmed">{userInfo.login}</Text>
                        </div>
                    ) : (
                        <div>
                            <Title order={1}>{userInfo.login}</Title>
                        </div>
                    )}
                    <Avatar src={userInfo.avatar_url} alt={userInfo.name} size="xl" />
                </Group>
                {userInfo.bio && (
                    <Group>
                        <IconInfoSquareRounded stroke={1.5} />
                        <Text>{userInfo.bio}</Text>
                    </Group>
                )}
                {userInfo.location && (
                    <Group>
                        <IconMapPin stroke={1.5} />
                        <Text>{userInfo.location}</Text>
                    </Group>
                )}

                <ResponsiveContainer height={300} width="100%" className="mt-4">
                    <LineChart
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        data={rechartsData}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis dataKey="overall" domain={[0, largestAverageContributions]} />
                        <Tooltip content={customChartTooltip} />
                        <Line
                            dataKey="overall"
                            stroke="#8884d8"
                            type="monotone"
                            activeDot={{ r: 8 }}
                            isAnimationActive={false}
                        />
                        {userInfo.repos.map((repo) => {
                            return (
                                <Line
                                    key={repo.name}
                                    dataKey={repo.name}
                                    type="monotone"
                                    stroke={getColor(userInfo.repos.indexOf(repo))}
                                    activeDot={{ r: 8 }}
                                    isAnimationActive={false}
                                    connectNulls
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>

                <Center mt="lg" mb="md">
                    <Title order={3}>Repositories</Title>
                </Center>
                <Container size="xl">
                    <Grid gutter="lg">
                        {userInfo.repos.map((repo) => {
                            return (
                                <Grid.Col key={repo.name} span={{ base: 12, md: 6, lg: 4 }}>
                                    <Link
                                        href={`/repo/${repo.name}`}
                                        target="_self"
                                        className="py-1.5 px-8 w-full h-14 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                                    >
                                        {repo.name}
                                        <IconArrowRight stroke={1.5} />
                                    </Link>
                                </Grid.Col>
                            );
                        })}
                    </Grid>
                </Container>
            </Stack>
        </Container>
    );
}
