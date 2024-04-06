import Nav from "@components/Nav";
import SessionProvider from "@components/SessionProvider";
import "@mantine/charts/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@styles/globals.css";
import { getServerSession } from "next-auth";

export const metadata = {
    title: "Gitulyse",
    description: "Code reporting and summary",
};

async function Rootlayout({ children }) {
    const session = await getServerSession();

    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
                <link
                    rel="icon"
                    href="/assets/images/logo.png"
                    type="image/png"
                    sizes="1080x1080"
                />
            </head>
            <body>
                <SessionProvider session={session}>
                    <MantineProvider defaultColorScheme="dark">
                        <div className="app">
                            <Nav />
                            {children}
                        </div>
                    </MantineProvider>
                </SessionProvider>
            </body>
        </html>
    );
}

export default Rootlayout;
