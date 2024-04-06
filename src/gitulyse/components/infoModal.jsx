"use client";
import React from "react";
import { Modal, Text, Container } from "@mantine/core";

const InfoModal = ({ opened, onClose }) => {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            size="calc(100vw - rem)"
            overlayOpacity={1}
            styles={{
                root: {
                    fontFamily: 'sans-serif',
                },
                body: {
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "flex-start",
                    height: "100%",
                    width: "100%",
                },
            }}
        >
            <h1 className="text-4xl font-bold text-center mb-4">How we calculate<br></br> these Metrics→</h1>

            <Container className="border-r border-gray-300 pr-10 w-1/3">
                <h2 className="text-lg font-bold text-center mb-4">Code Contributions</h2>
                <Text>
                    We collect information about contributors from GitHub, including the number of lines added, deleted, and commits made by each contributor, organized by month. Additionally, we calculate an average metric for each contributor, showing the average lines of code added or deleted per commit. Hence, we provide insights into individual activity and contributions over time.
                </Text>
            </Container>
            <Container className="border-r border-gray-300 pr-10 pl-10 w-1/3">
            <h2 className="text-lg font-bold text-center mb-4">Issue Creation and Resolution</h2>
                <Text>
                    We retrieve information about issues in a GitHub repository, including details such as issue title, author, creation and update timestamps, issue number, state (open or closed), and time taken to resolve closed issues. Additionally, we calculate the average time taken to resolve closed issues across the repository, offering insights into the efficiency of issue resolution processes.
                </Text>

            </Container>
            <Container className="pl-10 w-1/3">

                <h2 className="text-lg font-bold text-center mb-4">Pull Requests Merged</h2>
                <Text>
                    We track the number of pull requests merged by contributors and provide insights into collaboration and code integration within the project. Additionally, we provide the average time it takes on average to merge a pull request, offering insights into the efficiency of the code review process.
                </Text>
            </Container>
        </Modal>
    );
};

export default InfoModal;
