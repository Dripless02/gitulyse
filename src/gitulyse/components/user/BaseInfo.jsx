import { Avatar, Group, HoverCard, Stack, Text, Title } from "@mantine/core";
import { IconInfoSquareRounded, IconMapPin } from "@tabler/icons-react";

const BaseInfo = ({ userInfo }) => {
    return (
        <Stack gap="xs" h="12rem">
            <Group justify="space-between" className="mb-4">
                {userInfo.name ? (
                    <div>
                        <Title order={1}>{userInfo.name}</Title>
                        <Text c="dimmed">{userInfo.login}</Text>
                    </div>
                ) : (
                    <div>
                        <Title order={1}>{userInfo.login}</Title>
                    </div>
                )}
                <Avatar src={userInfo.avatar_url} alt={userInfo.name} size="xl" />
            </Group>
            {userInfo.bio && (
                <Group>
                    <IconInfoSquareRounded stroke={1.5} />
                    <HoverCard disabled={userInfo.bio.length < 200}>
                        <HoverCard.Target>
                            <Text maw="50rem" lineClamp={2}>
                                {userInfo.bio}
                            </Text>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <Text>{userInfo.bio}</Text>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </Group>
            )}
            {userInfo.location && (
                <Group>
                    <IconMapPin stroke={1.5} />
                    <Text>{userInfo.location}</Text>
                </Group>
            )}
        </Stack>
    );
};

export default BaseInfo;
