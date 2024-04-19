import { render, screen } from "@/testing-utils/test-utils";
import UserCompareDialog from "@/components/UserCompareDialog";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe("UserCompareDialog Component", () => {
    test("renders correctly", async () => {
        render(
            <UserCompareDialog
                users={["mock_user1", "mock_user2"]}
                setUsers={() => {}}
                opened={true}
                close={() => {}}
            />,
        );

        expect(screen.getByText(/Compare Users \(2\/2\)/i)).toBeInTheDocument();
    });

    test("removes user correctly", async () => {
        const setUsers = jest.fn();
        const close = jest.fn();

        render(
            <UserCompareDialog
                users={["mock_user1"]}
                setUsers={setUsers}
                opened={true}
                close={close}
            />,
        );

        const removeButton = screen.getByText(/Remove/i);
        removeButton.click();

        expect(setUsers).toHaveBeenCalledWith([]);
    });
});
