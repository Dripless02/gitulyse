"use client";
import React, { useState, useEffect } from "react";
import GaugeChart from "react-gauge-chart";
import { Button } from "@mantine/core";

export default function PercentagePullrequests({ userAccessToken, owner, repo }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [percentage, setPercentage] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        if (!formSubmitted || !userAccessToken) return;

        const queryParams = new URLSearchParams({
            token: userAccessToken,
            owner: owner,
            repo: repo,
            start_date: startDate,
            end_date: endDate,
        });

        fetch(`${BACKEND_URL}/get-percentage-pull-requests?${queryParams}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Data received", data);
                setPercentage(data.percentage_merged);
            })
            .catch((err) => console.error(err));
    }, [formSubmitted, userAccessToken, startDate, endDate, BACKEND_URL, owner, repo]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        console.log("Fetching data");
    };

    return (
        <div className="mt-3 flex flex-col items-center">
            <p className="mb-4 text-2xl">Percent of PR's merged/created from</p>
            <form onSubmit={handleSubmit}>
                <label className="mr-3">
                    Start Date:
                    <input
                        className="ml-1"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </label>
                <label>
                    End Date:
                    <input
                        className="ml-1"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </label>
                <Button type="submit" className="ml-3">
                    Submit
                </Button>
            </form>
            {percentage !== null && (
                <div style={{ width: "400px", margin: "20px auto" }}>
                    <GaugeChart
                        id="gauge-chart1"
                        percent={percentage / 100}
                        colors={["red", "yellow", "green"]}
                    />
                </div>
            )}
        </div>
    );
}
