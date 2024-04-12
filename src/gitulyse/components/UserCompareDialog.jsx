import { Button, Dialog, Group, Stack, Text } from "@mantine/core";

const UserCompareDialog = ({ users, setUsers, opened, close }) => {
    return (
        <Dialog
            opened={opened}
            onClose={close}
            size="md"
            radius="md"
            withBorder
            withCloseButton
            // position={{ bottom: 20, left: "50%" }}
            transitionProps={{ transition: "pop-bottom-right", duration: 200 }}
        >
            <Text align="center" weight={700} size="lg" mb={16}>
                Compare Users ({users.length}/2)
            </Text>
            <Stack align="stretch">
                {users.map((user) => (
                    <Group gap="sm" justify="space-between" fullWidth key={user}>
                        <Text>{user}</Text>
                        <Button
                            variant="filled"
                            color="red"
                            onClick={() => {
                                const filteredUsers = users.filter((u) => u !== user);
                                setUsers(filteredUsers);
                                if (filteredUsers.length === 0) {
                                    close();
                                }
                            }}
                        >
                            Remove
                        </Button>
                    </Group>
                ))}
            </Stack>
            <Button onClick={close} color="green" className="mt-5">
                Compare
            </Button>
        </Dialog>
    );
};

export default UserCompareDialog;
