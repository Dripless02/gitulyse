"use client";

import CodeContributions from "@components/repo/CodeContributions";
import IssueTracking from "@components/repo/IssueTracking";
import PullRequests from "@components/repo/PullRequests";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function RepoPage({ params }) {
    const owner = params.owner;
    const repo = params.repo;

    const [userAccessToken, setUserAccessToken] = useState("");
    const [dropzones, setDropzones] = useState(Array.from({ length: 4 }).fill(null));

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
                className={"cursor-pointer mb-2 p-1 border border-solid border-gray-400 rounded bg-white" + (isDragging ? " opacity-50" : "")}
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
                className={"relative min-w-[500px] min-h-96 border border-solid border-gray-400 rounded p-5" +
                    "" + (isOver && canDrop ? " border-green-500" : "")}
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
        const newDropzones = [...dropzones];
        newDropzones[index] = { name: item.name };
        setDropzones(newDropzones);
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
            default:
                return null;
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex max-w-full">
                <div className="mt-36 mr-16 flex flex-col">
                    <DraggableNavItem name="Pull Requests"/>
                    <DraggableNavItem name="Code Contributions"/>
                    <DraggableNavItem name="Issue Tracking"/>
                </div>
                <div className="mt-4 flex flex-col items-center">
                    <p className="mt-10 mb-10 text-5xl">Info for {repo}</p>
                    <div className="grid grid-cols-2 gap-4">
                        {dropzones.map((item, index) => (
                            <div key={index} className="flex">
                                <div style={{ flex: 1 }}>
                                    <DropZone
                                        onDrop={(itemName) => handleDrop(itemName, index)}
                                        index={index}
                                    >
                                        {item && renderItem(item)}
                                    </DropZone>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}