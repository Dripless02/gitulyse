"use client";


import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

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

        fetch(`${BACKEND_URL}/get-commits?${queryParams}`)
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
                setMonthlyData(Object.entries(data.monthly).map(([month, authors]) => ({
                    month,
                    ...authors
                })));
            });
    }, [userAccessToken, BACKEND_URL, owner, repo]);

    const handleAuthorSelection = (author) => {
        if (selectedAuthors.includes(author)) {
            setSelectedAuthors(selectedAuthors.filter((selectedAuthor) => selectedAuthor !== author));
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
                <Legend />
                {allAuthors.map((author) => (
                    <Line
                        key={author}
                        type="monotone"
                        dataKey={author}
                        name={author}
                        stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                        activeDot={{ r: 8 }}
                        isAnimationActive={false}
                        hide={!selectedAuthors.includes(author)}
                    />
                ))}
            </LineChart>
            <div className="mt-4">
                {allAuthors.map((author) => (
                    <button
                        key={author}
                        onClick={() => handleAuthorSelection(author)}
                        className={`mr-2 mb-2 p-2 rounded ${selectedAuthors.includes(author) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        {author}
                    </button>
                ))}
            </div>
        </div>
    );
}
