"use client";

import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const Repos = () => {
    const [userAccessToken, setUserAccessToken] = useState("");
    const [repos, setRepos] = useState([]);
    const { data: session, authenticated } = useSession();

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        async function getInfo() {
            const info = await getSession();
            if (info) {
                setUserAccessToken(info.accessToken);
            }
        }

        getInfo();
    }, []);

    useEffect(() => {
        if (!userAccessToken) return;

        fetch(`${BACKEND_URL}/get-repos?token=${userAccessToken}`)
            .then((res) => res.json())
            .then((data) => {
                setRepos(data.repos);
            });
    }, [userAccessToken]);

    return (
        <>
            {session ? (
                <div className="w-full flex-center flex-col">
                    {authenticated}
                    <p className="text-center text-xl py-4">Repos Owned by {session.user.name}</p>
                    <ul>
                        {repos.map((repo) => (
                            <li key={repo}>{repo}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <></>
            )}
        </>
    );
};

export default Repos;
