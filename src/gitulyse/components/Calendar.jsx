"use client";

import { ResponsiveCalendar } from '@nivo/calendar';
import { useEffect, useState } from 'react';

export default function Calendar({ userAccessToken }) {

    const [calendarData, setCalendarData] = useState([]);
    const [data, setData] = useState([]);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        if (!userAccessToken) return;
        console.log("----------------------------------------------")
        console.log("This is the BACKEND_URL", BACKEND_URL);
        console.log("This is the userAccessToken", userAccessToken);
        console.log("----------------------------------------------")

        fetch(`${BACKEND_URL}/github-activity?token=${userAccessToken}`)
            .then(res => res.json())
            .then(data => {
                setData(data);
            });

    },[userAccessToken]);

    useEffect(() => {
        const formattedData = data.map(item => ({
            day: item.day,
            month: item.month,
            year: item.year,
            value: item.value
        }));
        setCalendarData(formattedData);
    }, [data]);

    return (
        <div className='w-full overflow-hidden p-4'>
            <ResponsiveCalendar
                data={calendarData}
                from="2024-01-01"
                to="2024-12-31"
                emptyColor="#eeeeee"
                colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
                margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                yearSpacing={40}
                monthBorderColor="#ffffff"
                dayBorderWidth={2}
                dayBorderColor="#ffffff"
                legends={[
                    {
                        anchor: 'bottom-right',
                        direction: 'row',
                        translateY: 36,
                        itemCount: 4,
                        itemWidth: 42,
                        itemHeight: 36,
                        itemsSpacing: 14,
                        itemDirection: 'right-to-left'
                    }
                ]}
            />
        </div>

    );
}
