import { Group, Stack, Text } from "@mantine/core";
import {
    IconBook2,
    IconGitCommit,
    IconGitPullRequest,
    IconLanguage,
    IconTimeline,
} from "@tabler/icons-react";
import { sortLanguages } from "@/components/user/utils";

const ExtraUserInfo = ({ chartData, userInfo }) => {
    return (
        <Stack align="stretch" justify="center" gap="lg" className="my-3">
            <Group>
                <IconTimeline stroke={2} />
                <Text>
                    Highest average contributions per commit: {chartData.largest?.number} in{" "}
                    {chartData.largest?.month}
                </Text>
            </Group>

            <Group>
                <IconBook2 stroke={2} />
                <Text>Number of Repositories: {userInfo.repos?.length} </Text>
            </Group>

            <Group>
                <IconGitCommit stroke={2} />
                <Text>
                    Overall Total Commits:{" "}
                    {userInfo && userInfo.overall_contributions
                        ? Object.values(userInfo.overall_contributions).reduce(
                              (acc, month) => acc + month.commits,
                              0,
                          )
                        : 0}
                </Text>
            </Group>
            <Group>
                <IconGitPullRequest stroke={2} />
                <Text>Overall Number of Pull Requests Created: {userInfo.pull_request_count}</Text>
            </Group>
            <Group justify="flex-start" align="flex-start">
                <IconLanguage stroke={2} />
                <Stack>
                    <Text>Top 5 Languages Used:</Text>
                    <Text>Format: (Name: Bytes)</Text>
                </Stack>
                <Stack gap="xs">
                    {userInfo && userInfo.languages
                        ? sortLanguages(userInfo.languages)
                              .slice(0, 5)
                              .map((lang) => (
                                  <Text key={lang.language}>
                                      {lang.language}: {lang.count}
                                  </Text>
                              ))
                        : ""}
                </Stack>
            </Group>
        </Stack>
    );
};

export default ExtraUserInfo;
