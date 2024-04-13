"use client";

import { ResponsiveCalendar } from "@nivo/calendar";
import { useEffect, useState } from "react";
import GitTimeline from "@/components/GitTimeline";
import { Popover } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";

export default function Calendar({ userAccessToken, user }) {
    const [calendarData, setCalendarData] = useState([]);
    const [data, setData] = useState([]);
    const [day, setDay] = useState(null);
    const [opened, setOpened] = useState(false);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    const ref = useClickOutside(() => setOpened(false));

    useEffect(() => {
        if (!userAccessToken) return;
        fetch(`${BACKEND_URL}/github-activity?token=${userAccessToken}&user=${user}`)
            .then((res) => res.json())
            .then((data) => {
                setData(data);
            });
    }, [userAccessToken, user, BACKEND_URL]);

    useEffect(() => {
        const formattedData = data.map((item) => ({
            day: item.day,
            month: item.month,
            year: item.year,
            value: item.value,
        }));
        setCalendarData(formattedData);
    }, [data]);

    return (
        <Popover
            width={300}
            position="bottom-start"
            opened={opened}
            onChange={setOpened}
            offset={{ mainAxis: -40, crossAxis: 100 }}
        >
            <Popover.Target>
                <div className="h-72 w-full overflow-hidden p-4">
                    <ResponsiveCalendar
                        data={calendarData}
                        from={new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]}
                        to={new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0]}
                        emptyColor="#eeeeee"
                        colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
                        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                        yearSpacing={40}
                        monthBorderColor="#242424"
                        dayBorderWidth={2}
                        dayBorderColor="#242424"
                        legends={[
                            {
                                anchor: "bottom-right",
                                direction: "row",
                                translateY: 36,
                                itemCount: 4,
                                itemWidth: 42,
                                itemHeight: 36,
                                itemsSpacing: 14,
                                itemDirection: "right-to-left",
                            },
                        ]}
                        theme={{
                            labels: {
                                text: {
                                    fill: "#fff",
                                },
                            },
                        }}
                        onClick={(day) => {
                            if (day.value === undefined) return;
                            const today = new Date();
                            const selectedDate = new Date(day.day);
                            const diffTime = Math.abs(today - selectedDate);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays > 90) return;
                            setDay(day.day);
                            setOpened(true);
                        }}
                    />
                </div>
            </Popover.Target>
            <Popover.Dropdown ref={ref}>
                <GitTimeline userAccessToken={userAccessToken} user={user} date={day} />
            </Popover.Dropdown>
        </Popover>
    );
}
