"use client";

import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { Center, Title } from "@mantine/core";

const Repos = () => {
    const [userAccessToken, setUserAccessToken] = useState("");
    const [repos, setRepos] = useState([]);
    const router = useRouter();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

        fetch(`${BACKEND_URL}/get-repos?token=${userAccessToken}&limit=6`)
            .then((res) => res.json())
            .then((data) => {
                setRepos(data.repos);
            });
    }, [userAccessToken, BACKEND_URL]);

    const repos_to_data = (repos) => {
        let data = [["reponame", "commitcount"]];
        repos.forEach((repo) => {
            data.push([repo.name, repo.commit_count]);
        });

        return data;
    };

    return (
        <div className="w-full">
            <Center>
                <Title order={1}>Your Recently Updated Repos</Title>
            </Center>
            <Chart
                chartType="PieChart"
                data={repos_to_data(repos)}
                options={{
                    is3D: true,
                    backgroundColor: "transparent",
                    legend: "none",
                }}
                width="100%"
                height="600px"
                chartEvents={[
                    {
                        // select = onClick
                        eventName: "select",
                        callback: ({ chartWrapper }) => {
                            const chart = chartWrapper.getChart();
                            const selection = chart.getSelection();
                            if (selection.length === 1) {
                                const [selectedItem] = selection;
                                const dataTable = chartWrapper.getDataTable();

                                const { row } = selectedItem;
                                console.log(`'${dataTable.getValue(row, 0)}' selected`);
                                router.push(`/repo/${dataTable.getValue(row, 0)}`);
                            }
                        },
                    },
                ]}
            />
        </div>
    );
};

export default Repos;
