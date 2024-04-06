"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

export default function CodeContributions({ userAccessToken, owner, repo }) {
    const [monthlyData, setMonthlyData] = useState([]);
    const [selectedAuthors, setSelectedAuthors] = useState([owner]);
    const [allAuthors, setAllAuthors] = useState([]);
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
            <LineChart width={600} height={300} data={monthlyData}>
                <CartesianGrid strokeDasharray="3 4" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                {allAuthors.map((author, index) => (
                    <Line
                        key={author}
                        type="monotone"
                        dataKey={author}
                        name={author}
                        stroke={getColor(index)}
                        activeDot={{ r: 8 }}
                        isAnimationActive={false}
                        hide={!selectedAuthors.includes(author)}
                    />
                ))}
            </LineChart>
            <div className="mt-4">
                {allAuthors.map((author, index) => (
                    <button
                        key={author}
                        onClick={() => handleAuthorSelection(author)}
                        className={`mr-2 mb-2 p-2 rounded ${
                            selectedAuthors.includes(author) ? "" : "bg-gray-200 text-gray-500"
                        }`}
                        style={{
                            backgroundColor: selectedAuthors.includes(author)
                                ? getColor(index)
                                : "",
                        }}
                    >
                        {author}
                    </button>
                ))}
            </div>
        </div>
    );

    function getColor(index) {
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
    }
}
