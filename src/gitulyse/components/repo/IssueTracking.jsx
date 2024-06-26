"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Loader } from "@mantine/core";

export default function IssueTracking({ userAccessToken, owner, repo }) {
    const [data, setData] = useState([]);
    const [averageTimeToResolve, setAverageTimeToResolve] = useState(0);
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        if (!userAccessToken) return;

        fetch(`${BACKEND_URL}/get-issues?token=${userAccessToken}&owner=${owner}&repo=${repo}`)
            .then((res) => res.json())
            .then((data) => {
                const { issues, average_time_to_resolve } = data;
                setData(issues);
                setAverageTimeToResolve(average_time_to_resolve);
                setLoading(false);
            });
    }, [userAccessToken, BACKEND_URL, owner, repo]);

    const formatTime = (totalSeconds) => {
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        let formattedTime = '';
        if (days > 0) {
            formattedTime += `${days}d `;
        }
        if (hours > 0) {
            formattedTime += `${hours}h `;
        }
        if (minutes > 0) {
            formattedTime += `${minutes}m `;
        }
        formattedTime += `${seconds}s`;

        return formattedTime;
    };

    const largestFormatTime = (totalSeconds) => {
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (days > 0) {
            return `${days}d`;
        }
        if (hours > 0) {
            return `${hours}h`;
        }
        if (minutes > 0) {
            return `${minutes}m`;
        }
        return `${totalSeconds}s`;
    };


    return (
        <div className="mt-3 flex flex-col items-center">
            <p className="mb-4 text-2xl">Issue Tracking</p>
            {loading ? (
                <Loader />
            ) : (
                data.length !== 0 ? (
                    <div>
                        <p>Average Time to Resolve Issues: {formatTime(averageTimeToResolve)}</p>
                        <AreaChart width={600} height={300} data={data}>
                            <CartesianGrid strokeDasharray="3 4"/>
                            <XAxis dataKey="issue_number"/>
                            <YAxis tickFormatter={(value) => largestFormatTime(value)}/>
                            <Tooltip formatter={(value) => formatTime(value)}/>
                            <Legend/>
                            <Area type="monotone" dataKey="time_to_close.total_seconds" stackId="1" stroke="#8884d8"
                                  fill="#8884d8" name="Time to Resolve"/>
                        </AreaChart>
                    </div>
                ) : (
                    <p>No issues found</p>
                )
            )}
        </div>
    );
}
