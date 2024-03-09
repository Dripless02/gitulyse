"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export default function PullRequests({ userAccessToken, owner, repo }) {
    const [pullRequests, setPullRequests] = useState([]);
    const [timeToMergeData, setTimeToMergeData] = useState([]);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        if (!userAccessToken) return;

        fetch(
            `${BACKEND_URL}/get-pull-requests?token=${userAccessToken}&owner=${owner}&repo=${repo}`,
        )
            .then((res) => res.json())
            .then((data) => {
                setPullRequests(data.pull_requests);
            });
    }, [userAccessToken, BACKEND_URL, owner, repo]);

    useEffect(() => {
        if (pullRequests.length > 0) {
            const newData = pullRequests.map((pr) => ({
                name: pr.pr_number.toString(),
                time_to_merge: pr.time_to_merge ? pr.time_to_merge.total_seconds : 0
            }));
            setTimeToMergeData(newData);
        }
    }, [pullRequests]);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <div className="mt-4 flex flex-col items-center">
            <p className="mb-4 text-2xl">Time to Merge Pull requests</p>

            {pullRequests.length > 0 && (
                <BarChart width={600} height={300} data={timeToMergeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickFormatter={(value) => `PR ${value}`} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatTime(value)} />
                    <Legend />
                    <Bar dataKey="time_to_merge" fill="#8884d8" name="Time to Merge" />
                </BarChart>
            )}

        </div>
    );
}