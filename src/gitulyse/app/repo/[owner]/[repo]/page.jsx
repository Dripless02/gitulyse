"use client";

import PullRequests from "@components/repo/PullRequests";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function RepoPage({ params }) {
    const owner = params.owner;
    const repo = params.repo;

    const [userAccessToken, setUserAccessToken] = useState("");

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

    return (
        <div className="mt-4 flex flex-col items-center">
            <p className="mb-4 text-5xl">
                Info for {owner}/{repo}
            </p>
            <PullRequests owner={owner} repo={repo} userAccessToken={userAccessToken} />
        </div>
    );
}
