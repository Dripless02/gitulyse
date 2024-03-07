"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function CodeContributions({ userAccessToken, owner, repo }) {
    const [monthlyAverages, setMonthlyAverages] = useState([]);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        if (!userAccessToken) return;

        fetch(`${BACKEND_URL}/get-commits?token=${userAccessToken}&owner=${owner}&repo=${repo}`)
            .then((res) => res.json())
            .then((data) => {
                const monthlyAveragesData = Object.keys(data.monthly).map((key) => {
                    return { month: key, average: data.monthly[key].average_lines_of_code };
                });
                setMonthlyAverages(monthlyAveragesData);
            });
    }, [userAccessToken, BACKEND_URL, owner, repo]);

    return (
        <div className="mt-4 flex flex-col items-center">
          <p className="mb-4 text-2xl">Code Contributions per Month</p>
            <LineChart width={600} height={300} data={monthlyAverages}>
                <CartesianGrid strokeDasharray="3 4" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </div>
    );
}