"use client";

import CodeContributions from "@/components/repo/CodeContributions";
import IssueTracking from "@/components/repo/IssueTracking";
import PullRequests from "@/components/repo/PullRequests";
import PercentagePullrequests from "@/components/repo/PercentagePullrequests";
import PercentageIssues from "@/components/repo/PercentageIssues";
import { getSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
    IconEye,
    IconGitFork,
    IconGitPullRequest,
    IconGitPullRequestDraft,
    IconLanguage,
    IconStar,
    IconUser,
} from "@tabler/icons-react";
import { Group, Loader, ScrollArea, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function RepoPage({ params }) {
    const owner = params.owner;
    const repo = params.repo;
    const startDate = params.startDate;
    const endDate = params.endDate;

    const [userAccessToken, setUserAccessToken] = useState("");
    // const [dropzones, setDropzones] = useState(Array.from({ length: 4 }).fill(null));
    const [dropzone_1, setDropzone_1] = useState(null);
    const [dropzone_2, setDropzone_2] = useState(null);
    const [dropzone_3, setDropzone_3] = useState(null);
    const [dropzone_4, setDropzone_4] = useState(null);
    const [repoInfo, setRepoInfo] = useState(null);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

        fetch(`${BACKEND_URL}/get-repo-stats?token=${userAccessToken}&owner=${owner}&repo=${repo}`)
            .then((res) => res.json())
            .then((data) => {
                setRepoInfo(data);
            });
    }, [BACKEND_URL, owner, repo, userAccessToken]);

    const DraggableNavItem = ({ name }) => {
        const [{ isDragging }, drag] = useDrag(() => ({
            type: "NAV_ITEM",
            item: { name },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
        }));

        return (
            <div
                ref={drag}
                className={
                    "cursor-pointer mb-2 p-3 rounded bg-cyan-950 text-green-100" +
                    (isDragging ? " opacity-50" : "")
                }
            >
                {name}
            </div>
        );
    };

    const DropZone = ({ onDrop, children, index }) => {
        const [{ isOver, canDrop }, drop] = useDrop(() => ({
            accept: "NAV_ITEM",
            drop: (item) => onDrop(item, index),
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }));

        return (
            <div
                ref={drop}
                className={
                    "relative min-w-[500px] min-h-96 border border-solid border-gray-400 rounded p-5" +
                    (isOver && canDrop ? " border-green-500" : "")
                }
            >
                {isOver && canDrop && (
                    <p
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        Drop here
                    </p>
                )}
                {children}
            </div>
        );
    };

    const handleDrop = (item, index) => {
        // const newDropzones = [...dropzones];
        // newDropzones[index] = { name: item.name };
        // setDropzones(newDropzones);
        switch (index) {
            case 0:
                setDropzone_1({ name: item.name });
                break;
            case 1:
                setDropzone_2({ name: item.name });
                break;
            case 2:
                setDropzone_3({ name: item.name });
                break;
            case 3:
                setDropzone_4({ name: item.name });
                break;
            default:
                break;
        }
    };


    const renderItem = (item) => {
        const { name } = item;
        switch (name) {
            case "Code Contributions":
                return (
                    <CodeContributions
                        owner={owner}
                        repo={repo}
                        userAccessToken={userAccessToken}
                    />
                );
            case "Pull Requests":
                return <PullRequests owner={owner} repo={repo} userAccessToken={userAccessToken}/>;
            case "Issue Tracking":
                return (
                    <IssueTracking owner={owner} repo={repo} userAccessToken={userAccessToken}/>
                );
            case "Percentage Pull Requests":
                return (
                    <PercentagePullrequests
                        start_date={startDate}
                        end_date={endDate}
                        owner={owner}
                        repo={repo}
                        userAccessToken={userAccessToken}
                    />
                );
            case "Percentage Issues":
                return (
                    <PercentageIssues
                        start_date={startDate}
                        end_date={endDate}
                        owner={owner}
                        repo={repo}
                        userAccessToken={userAccessToken}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex max-w-full">
                <div className="mt-36 mr-12 flex flex-col w-64">
                    <Title order={2} className="pb-3">
                        My Available Stats
                    </Title>
                    <DraggableNavItem name="Pull Requests"/>
                    <DraggableNavItem name="Code Contributions"/>
                    <DraggableNavItem name="Issue Tracking"/>
                    <DraggableNavItem name="Percentage Pull Requests"/>
                    <DraggableNavItem name="Percentage Issues"/>
                    {repoInfo ? (
                        <Stack align="flex-start" justify="flex-start">
                            <Title order={1}>Overall Stats</Title>
                            <Group>
                                <IconStar stroke={2}/>
                                <Text size="lg">Stars: {repoInfo?.stars}</Text>
                            </Group>
                            <Group>
                                <IconGitFork stroke={2}/>
                                <Text size="lg">Forks: {repoInfo?.forks}</Text>
                            </Group>
                            <Group>
                                <IconEye stroke={2}/>
                                <Text size="lg">Watchers: {repoInfo?.watchers}</Text>
                            </Group>
                            <Group>
                                <IconGitPullRequest stroke={2}/>
                                <Text size="lg">
                                    Closed Pull Requests:{" "}
                                    {repoInfo?.pull_requests - repoInfo?.open_pull_requests}
                                </Text>
                            </Group>
                            <Group>
                                <IconGitPullRequestDraft stroke={2}/>
                                <Text size="lg">
                                    Open Pull Requests: {repoInfo?.open_pull_requests}
                                </Text>
                            </Group>
                            <Group justify="flex-start" align="flex-start">
                                <IconLanguage stroke={2}/>
                                <Stack>
                                    {repoInfo?.languages &&
                                        Object.entries(repoInfo?.languages)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([language, bytes]) => (
                                                <Group key={language}>
                                                    <Text size="lg">
                                                        {language}: {bytes}
                                                    </Text>
                                                </Group>
                                            ))}
                                </Stack>
                            </Group>
                            <Group justify="flex-start" align="flex-start">
                                <IconUser stroke={2}/>
                                <ScrollArea h={350}>
                                    <Stack>
                                        {repoInfo?.contributors
                                            .filter(
                                                (contributor) =>
                                                    !contributor.login.endsWith("[bot]"),
                                            )
                                            .map((contributor) => (
                                                <Group key={contributor}>
                                                    <Text size="lg">
                                                        <Link
                                                            href={`/user/${contributor.login}`}
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            {contributor.login}
                                                        </Link>
                                                        : {contributor.contributions}
                                                    </Text>
                                                </Group>
                                            ))}
                                    </Stack>
                                </ScrollArea>
                            </Group>
                        </Stack>
                    ) : (
                        <Loader color="blue" size="xl"/>
                    )}
                </div>
                <div className="mt-4 flex flex-col items-center">
                    <p className="mt-10 mb-10 text-5xl">
                        Info for {owner}/{repo}
                    </p>
                    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                        {/*{dropzones.map((item, index) => (*/}
                        {/*    <div key={index} className="flex">*/}
                        {/*        <div className="flex-1">*/}
                        {/*            <DropZone*/}
                        {/*                onDrop={(itemName) => handleDrop(itemName, index)}*/}
                        {/*                index={index}*/}
                        {/*            >*/}
                        {/*                {item && renderItem(item)}*/}
                        {/*            </DropZone>*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*))}*/}
                        <div className="flex">
                            <div className="flex-1">
                                {useMemo(() => (
                                    <DropZone
                                        onDrop={(itemName) => handleDrop(itemName, 0)}
                                        index={0}
                                    >
                                        {dropzone_1 && renderItem(dropzone_1)}
                                    </DropZone>
                                ), [dropzone_1])}
                            </div>
                        </div>
                        <div className="flex">
                            <div className="flex-1">
                                {useMemo(() => (
                                    <DropZone
                                        onDrop={(itemName) => handleDrop(itemName, 1)}
                                        index={1}
                                    >
                                        {dropzone_2 && renderItem(dropzone_2)}
                                    </DropZone>
                                ), [dropzone_2])}
                            </div>
                        </div>
                        <div className="flex">
                            <div className="flex-1">
                                {useMemo(() => (
                                    <DropZone
                                        onDrop={(itemName) => handleDrop(itemName, 2)}
                                        index={2}
                                    >
                                        {dropzone_3 && renderItem(dropzone_3)}
                                    </DropZone>
                                ), [dropzone_3])}
                            </div>
                        </div>
                        <div className="flex">
                            <div className="flex-1">
                                {useMemo(() => (
                                    <DropZone
                                        onDrop={(itemName) => handleDrop(itemName, 3)}
                                        index={3}
                                    >
                                        {dropzone_4 && renderItem(dropzone_4)}
                                    </DropZone>
                                ), [dropzone_4])}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}
