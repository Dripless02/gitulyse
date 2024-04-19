import { render, screen } from "@/testing-utils/test-utils";
import InfoModal from "@/components/infoModal";

describe("InfoModal Component", () => {
    test("renders correctly", async () => {
        render(<InfoModal opened={true} onClose={() => {}} />);

        expect(screen.getByText(/Code Contributions/i)).toBeInTheDocument();
        expect(screen.getByText(/Issue Creation and Resolution/i)).toBeInTheDocument();
        expect(screen.getByText("Pull Requests Merged")).toBeInTheDocument();
    });
});
