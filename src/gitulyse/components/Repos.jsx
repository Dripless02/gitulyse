"use client";

import { PieChart } from "@mantine/charts";
import { List } from "@mantine/core";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const Repos = () => {
    const [userAccessToken, setUserAccessToken] = useState("");
    const [repos, setRepos] = useState([]);
    const { data: session } = useSession();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

        fetch(`${BACKEND_URL}/get-repos?token=${userAccessToken}`)
            .then((res) => res.json())
            .then((data) => {
                setRepos(data.repos);
            });
    }, [userAccessToken]);

    const repos_to_data = (repos) => {
        // https://mantine.dev/theming/colors/#default-colors
        const colors = [
            "red.6",
            "pink.6",
            "grape.6",
            "violet.6",
            "indigo.6",
            "blue.6",
            "cyan.6",
            "teal.6",
            "green.6",
            "lime.6",
            "yellow.6",
            "orange.6",
        ];

        let data = [];
        repos.forEach((repo, index) => {
            data.push({
                value: repo.commit_count,
                color: colors[index % colors.length],
                name: repo.name,
            });
        });

        return data;
    };

    return (
        <div className="w-full flex-center flex-col pt-6">
            <p className="text-center text-3xl pb-3 pt-6">
                Your Repo's
            </p>
            <PieChart
                size={300}
                data={repos_to_data(repos)}
                withTooltip
                tooltipDataSource="segment"
                mx="auto"
                strokeWidth={2}
                onClick={(event) => {
                    // as there is no way to get the exact segment that the user clicked on
                    // we can use the event target to get the name of the repo assigned to
                    // the segment that was clicked on
                    const repo_name = event.target.attributes["name"].value;
                    window.open(`https://www.github.com/${repo_name}`);
                }}
            />



        </div>
    );
};

export default Repos;
