"use client";
import { useEffect, useState } from "react";

export default function CodeContributions({userAccessToken, owner, repo}) {
    const [codeContributions, setCodeContributions] = useState([]);
    const [showCodeContributions, setShowCodeContributions] = useState(false);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        if (!userAccessToken) return;

        fetch(
            `${BACKEND_URL}/get-commits?token=${userAccessToken}&owner=${owner}&repo=${repo}`,
        )
            .then((res) => res.json())
            .then((data) => {
                setCodeContributions(data.commits);
            });
    }, [userAccessToken, BACKEND_URL, owner, repo]);



    return (
        <div>
            <button
                onClick={() => setShowCodeContributions(!showCodeContributions)}
                className="mt-4 text-3xl"
            >
                {showCodeContributions ? "Hide" : "Show"} code contributions
            </button>
            {showCodeContributions && (
                <div>
                    {codeContributions.map((contribution) => {
                        return (
                            <div key={contribution.id} className="mt-4">
                                <p>
                                    {contribution.author} made {contribution.additions} additions and{" "}
                                    {contribution.deletions} deletions in {contribution.file} on{" "}
                                    {new Date(contribution.date).toLocaleString()}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
            }