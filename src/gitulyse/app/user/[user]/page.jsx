"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Avatar, Group, List, Text, Title } from "@mantine/core";

export default function UserPage({ params }) {
    const user = params.user;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const [userAccessToken, setUserAccessToken] = useState("");
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        if (!userAccessToken) return;

        fetch(`${BACKEND_URL}/get-user?token=${userAccessToken}&user=${user}`)
            .then((res) => res.json())
            .then((data) => {
                setUserInfo(data);
                setIsLoading(false);
            });
    }, [BACKEND_URL, user, userAccessToken]);

    return isLoading ? (
        <p>Loading...</p>
    ) : (
        <div className="mt-7">
            <Group justify="space-between" className="mb-4">
                <Title order={1}>
                    {userInfo.name} ({userInfo.login})
                </Title>
                <Avatar src={userInfo.avatar_url} alt={userInfo.name} size="xl" />
            </Group>
            <Text>Bio: {userInfo.bio}</Text>
            <Text>Location: {userInfo.location}</Text>
            <Text>Number of Public Repos: {userInfo.public_repo_count}</Text>
            <Text mt="md">Repos:</Text>
            <List listStyleType="disc">
                {userInfo.repos.map((repo_name) => {
                    return <List.Item key={repo_name}>{repo_name}</List.Item>;
                })}
            </List>
        </div>
    );
}
