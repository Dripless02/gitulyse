import "@/testing-utils/matchMediaMock";
import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";

jest.mock("next/navigation", () => jest.requireActual("next-router-mock"));

const AllTheProviders = ({ children }) => {
    return <MantineProvider defaultColorScheme="dark">{children}</MantineProvider>;
};

const customRender = (ui, options) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";

export { customRender as render };
