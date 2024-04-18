"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";
import { getColour } from "@/components/user/utils";
import CustomChartTooltip from "@/components/user/CustomChartTooltip";
import { Loader } from "@mantine/core";

export default function CodeContributions({ userAccessToken, owner, repo }) {
    const [monthlyData, setMonthlyData] = useState([]);
    const [selectedAuthors, setSelectedAuthors] = useState([owner]);
    const [allAuthors, setAllAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        if (!userAccessToken) return;

        const queryParams = new URLSearchParams({
            token: userAccessToken,
            owner: owner,
            repo: repo,
        });

        fetch(`${BACKEND_URL}/code-contribution-stats?${queryParams}`)
            .then((res) => res.json())
            .then((data) => {
                // Extract all authors from the data
                const authors = Object.keys(data.monthly).reduce((acc, month) => {
                    const monthAuthors = Object.keys(data.monthly[month]);
                    return [...acc, ...monthAuthors];
                }, []);

                // Remove duplicates and set all authors
                setAllAuthors([...new Set(authors)]);

                // Set monthly data
                setMonthlyData(
                    Object.entries(data.monthly).map(([month, authors]) => ({
                        month,
                        ...authors,
                    })),
                );
                setLoading(false);
            });
    }, [userAccessToken, BACKEND_URL, owner, repo]);

    const handleAuthorSelection = (author) => {
        if (selectedAuthors.includes(author)) {
            setSelectedAuthors(
                selectedAuthors.filter((selectedAuthor) => selectedAuthor !== author),
            );
        } else {
            setSelectedAuthors([...selectedAuthors, author]);
        }
    };

    return (
        <div className="mt-4 flex flex-col items-center">
            <p className="mb-4 text-2xl">Code Contributions per Month</p>

            {loading ? (
                <Loader/>
            ) : (
                monthlyData.length !== 0 ? (
                <>
                    <LineChart width={600} height={300} data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 4"/>
                        <XAxis dataKey="month"/>
                        <YAxis/>
                        <Tooltip content={CustomChartTooltip}/>
                        {allAuthors.map((author, index) => (
                            <Line
                                key={author}
                                type="monotone"
                                dataKey={author}
                                name={author}
                                stroke={getColour(index)}
                                activeDot={{ r: 8 }}
                                isAnimationActive={false}
                                hide={!selectedAuthors.includes(author)}
                            />
                        ))}
                    </LineChart>
                    <div className="mt-4">
                        <button
                            className="mr-2 mb-2 p-2 rounded bg-blue-500 text-white"
                            onClick={() => {
                                if (selectedAuthors.length === allAuthors.length) {
                                    setSelectedAuthors([]);
                                } else {
                                    setSelectedAuthors(allAuthors);
                                }
                            }}
                        >
                            Toggle All
                        </button>
                        {allAuthors.map((author, index) => (
                            <button
                                key={author}
                                onClick={() => handleAuthorSelection(author)}
                                className={`mr-2 mb-2 p-2 rounded ${
                                    selectedAuthors.includes(author) ? "" : "bg-gray-200 text-gray-500"
                                }`}
                                style={{
                                    backgroundColor: selectedAuthors.includes(author)
                                        ? getColour(index)
                                        : "",
                                }}
                            >
                                {author}
                            </button>
                        ))}
                    </div>
                </>
                ) : (
                    <p>No data available</p>
                )
            )}
        </div>
    );
}
