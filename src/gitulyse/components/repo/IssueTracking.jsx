"use client"
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function IssueTracking({ userAccessToken, owner, repo }) {
    const [data, setData] = useState([]);
    const [averageTimeToResolve, setAverageTimeToResolve] = useState(0);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        if (!userAccessToken) return;

        fetch(`${BACKEND_URL}/get-issues?token=${userAccessToken}&owner=${owner}&repo=${repo}`)
            .then((res) => res.json())
            .then((data) => {
                const { issues, average_time_to_resolve } = data;
                setData(issues);
                setAverageTimeToResolve(average_time_to_resolve);
            });
    }, [userAccessToken, BACKEND_URL, owner, repo]);

    return (
        <div className="mt-4 flex flex-col items-center">
            <p className="mb-4 text-2xl">Issue Tracking</p>
            <div>
                <p>Average Time to Resolve Issues: {averageTimeToResolve} seconds</p>
                <AreaChart width={600} height={300} data={data}>
                    <CartesianGrid strokeDasharray="3 4" />
                    <XAxis dataKey="issue_number" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="time_to_close.total_seconds" stackId="1" stroke="#8884d8" fill="#8884d8" name="Time to Close (Seconds)" />
                </AreaChart>
            </div>
        </div>
    );
}
