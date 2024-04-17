import { useEffect, useState } from "react";
import { Center, Loader, Text, Timeline } from "@mantine/core";

const GitTimeline = ({ userAccessToken, user, date }) => {
    const [commits, setCommits] = useState();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        if (!userAccessToken) return;
        fetch(
            `${BACKEND_URL}/github-activity-day?token=${userAccessToken}&user=${user}&date=${date}`,
        )
            .then((res) => res.json())
            .then((data) => {
                setCommits(data);
            });
    }, [BACKEND_URL, date, user, userAccessToken]);

    return (
        <div style={{ maxHeight: "600px", overflowY: "auto", overflowX: "hidden" }}>
            {commits && commits.length ? (
                <Timeline active={commits && commits.length} lineWidth={6}>
                    {commits &&
                        parseEvents(commits)
                            .reverse()
                            .map((event) => (
                                <Timeline.Item
                                    key={event.created_at}
                                    color={event.color}
                                    title={event.title}
                                    label={event.label}
                                >
                                    <Text size="sm">{event.message}</Text>
                                    <Text size="xs" c="dimmed">
                                        {event.created_at}
                                    </Text>
                                </Timeline.Item>
                            ))}
                </Timeline>
            ) : (
                <Center>
                    <Loader color="blue" size={50} />
                </Center>
            )}
        </div>
    );
};

const parseEvents = (events) => {
    const parsed = [];
    for (const event of events) {
        const parsed_event = {};
        parsed_event.title = event.repo;
        parsed_event.created_at = event.created_at.replace("T", " ").replace(/\+.+$/, "");

        switch (event.type) {
            case "DeleteEvent":
                parsed_event.color = "red";
                parsed_event.label = "Deleted";
                parsed_event.message = `Deleted ${event.payload.ref_type} ${event.payload.ref}`;
                break;
            case "PushEvent":
                parsed_event.color = "blue";
                parsed_event.label = "Pushed";
                event.payload.ref = event.payload.ref.replace("refs/heads/", "");
                parsed_event.message = `Pushed to ${event.payload.ref}`;
                break;
            case "CreateEvent":
                parsed_event.color = "green";
                parsed_event.label = "Created";
                parsed_event.message = `Created ${event.payload.ref_type} ${
                    event.payload.ref || ""
                }`;
                break;
            case "PullRequestEvent":
                parsed_event.color = "purple";
                parsed_event.label = "PR";
                parsed_event.message = `${event.payload.action} PR ${event.payload.number}`;
                break;
            case "WatchEvent":
                parsed_event.color = "yellow";
                parsed_event.label = "Starred";
                parsed_event.message = `Starred ${event.repo}`;
                break;
            case "ForkEvent":
                parsed_event.color = "cyan";
                parsed_event.label = "Forked";
                parsed_event.message = `Forked ${event.repo}`;
                break;
            case "PublicEvent":
                parsed_event.color = "gray";
                parsed_event.label = "Public";
                parsed_event.message = `Made ${event.repo} public`;
                break;
            default:
                parsed_event.color = "gray";
                parsed_event.label = "Event";
                parsed_event.message = event.type;
                break;
        }

        parsed.push(parsed_event);
    }

    return parsed;
};
export default GitTimeline;
