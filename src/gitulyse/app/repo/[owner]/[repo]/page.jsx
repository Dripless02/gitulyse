"use client";

import { Card, Group } from "@mantine/core";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function PullRequestPage({ params }) {
    const owner = params.owner;
    const repo = params.repo;

    const [userAccessToken, setUserAccessToken] = useState("");
    const [pullRequests, setPullRequests] = useState([]);
    const [averageTimeToMerge, setAverageTimeToMerge] = useState({});
    const [ownerAverageTimeToMerge, setOwnerAverageTimeToMerge] = useState({});
    const [averageTimeToMergeString, setAverageTimeToMergeString] = useState([]);
    const [ownerAverageTimeToMergeString, setOwnerAverageTimeToMergeString] = useState([]);

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

    const calculateAverageTimeToMerge = () => {
        let countAll = 0;
        let totalSecondsAll = 0;
        let countOwner = 0;
        let totalSecondsOwner = 0;

        pullRequests.forEach((pr) => {
            if (pr.time_to_merge) {
                totalSecondsAll += pr.time_to_merge.total_seconds;
                countAll++;
                if (pr.author === owner) {
                    totalSecondsOwner += pr.time_to_merge.total_seconds;
                    countOwner++;
                }
            }
        });

        const calculateAverage = (totalSeconds, count) => {
            const averageTotalSeconds = totalSeconds / count;
            const days = Math.floor(averageTotalSeconds / 86400);
            const hours = Math.floor((averageTotalSeconds - days * 86400) / 3600);
            const minutes = Math.floor((averageTotalSeconds - days * 86400 - hours * 3600) / 60);
            const seconds = Math.floor(
                averageTotalSeconds - days * 86400 - hours * 3600 - minutes * 60,
            );

            return {
                days: days,
                hours: hours,
                minutes: minutes,
                seconds: seconds,
            };
        };

        setAverageTimeToMerge(calculateAverage(totalSecondsAll, countAll));
        setOwnerAverageTimeToMerge(calculateAverage(totalSecondsOwner, countOwner));
    };

    useEffect(() => {
        if (pullRequests.length > 0) {
            calculateAverageTimeToMerge();
        }
    }, [pullRequests]);

    useEffect(() => {
        const {
            days: overallDays,
            hours: overallHours,
            minutes: overallMinutes,
            seconds: overallSeconds,
        } = averageTimeToMerge;

        setAverageTimeToMergeString([
            overallDays !== 0 ? `${overallDays} days` : "",
            overallHours !== 0 ? `${overallHours} hours` : "",
            overallMinutes !== 0 ? `${overallMinutes} minutes` : "",
            overallSeconds !== 0 ? `${overallSeconds} seconds` : "",
        ]);

        const {
            days: ownerDays,
            hours: ownerHours,
            minutes: ownerMinutes,
            seconds: ownerSeconds,
        } = ownerAverageTimeToMerge;

        setOwnerAverageTimeToMergeString([
            ownerDays ? `${ownerDays} days` : "",
            ownerHours ? `${ownerHours} hours` : "",
            ownerMinutes ? `${ownerMinutes} minutes` : "",
            ownerSeconds ? `${ownerSeconds} seconds` : "",
        ]);
    }, [averageTimeToMerge, ownerAverageTimeToMerge]);

    return (
        <div className="mt-4 flex flex-col items-center">
            <p className="mb-4 text-5xl">
                Info for {owner}/{repo}
            </p>

            <p className="mb-4 text-2xl">Pull Requests</p>
            <p className="mb-4 text-xl">
                Overall Average Time to Merge: {averageTimeToMergeString.join(" ")}
            </p>
            <p className="mb-4 text-xl">
                Average Time to Merge where '{owner}' is the author:{" "}
                {ownerAverageTimeToMergeString.join(" ")}
            </p>

            <div className="flex-col flexitems-center">
                {pullRequests.map((pr) => {
                    let time_to_merge = "";
                    if (pr.time_to_merge) {
                        const { days, hours, minutes, seconds } = pr.time_to_merge;
                        if (days) time_to_merge += `${days} days `;
                        if (hours) time_to_merge += `${hours} hours `;
                        if (minutes) time_to_merge += `${minutes} minutes `;
                        if (seconds) time_to_merge += `${seconds} seconds`;
                    }

                    return (
                        <Card key={pr.pr_number} className="mb-4 w-auto">
                            <Group justify="space-between" mt="md" mb="xs">
                                <p className="text-xl font-bold">
                                    PR #{pr.pr_number} - {pr.title}
                                </p>
                                <p>{pr.state}</p>
                            </Group>
                            <p className="mb-4 font-bold">Author: {pr.author}</p>
                            <p>Created at {pr.created_at}</p>
                            <p>Updated at {pr.updated_at}</p>
                            {pr.merged_at ? (
                                <>
                                    <p>Merged at {pr.merged_at}</p>
                                    <p>Time to Merge: {time_to_merge} </p>
                                </>
                            ) : (
                                pr.closed_at && <p>Closed at {pr.closed_at}</p>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
