"use client";

import { Card, Group } from "@mantine/core";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function PullRequestPage({ params }) {
    const owner = params.owner;
    const repo = params.repo;

    const [userAccessToken, setUserAccessToken] = useState("");
    const [pullRequests, setPullRequests] = useState([]);

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

        fetch(
            `${BACKEND_URL}/get-pull-requests?token=${userAccessToken}&owner=${owner}&repo=${repo}`,
        )
            .then((res) => res.json())
            .then((data) => {
                setPullRequests(data.pull_requests);
            });
    }, [userAccessToken]);

    return (
        <div className="mt-4 flex flex-col items-center">
            <p className="mb-4 text-5xl">
                Info for {owner}/{repo}
            </p>

            <p className="mb-4 text-2xl">Pull Requests</p>
            <div className=" flex-col flexitems-center">
                {pullRequests.map((pr) => (
                    <Card key={pr.pr_number} className="mb-4 w-auto">
                        <Group justify="space-between" mt="md" mb="xs">
                            <p className="text-xl font-bold">
                                PR #{pr.pr_number} - {pr.title}
                            </p>
                            <p>{pr.state}</p>
                        </Group>
                        <p>Created at {pr.created_at}</p>
                        <p>Updated at {pr.updated_at}</p>
                        {pr.merged_at ? (
                            <p>Merged at {pr.merged_at}</p>
                        ) : (
                            pr.closed_at && <p>Closed at {pr.closed_at}</p>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
