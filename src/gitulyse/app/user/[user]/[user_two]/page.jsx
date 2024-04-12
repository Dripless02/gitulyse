import { Box, Center, Divider, Group, Title } from "@mantine/core";
import UserPage from "@/app/user/[user]/page";

const UserComparePage = ({ params }) => {
    const { user: user_one, user_two } = params;
    return (
        <Box className="max-w-full mt-6">
            <Center>
                <Title order={1}>
                    Comparison between &apos;{user_one}&apos; and &apos;{user_two}&apos;
                </Title>
            </Center>

            <Group gap="xs" justify="space-between" align="normal">
                <UserPage params={{ user: user_one }} />
                <Divider orientation="vertical" />
                <UserPage params={{ user: user_two }} />
            </Group>
        </Box>
    );
};

export default UserComparePage;
