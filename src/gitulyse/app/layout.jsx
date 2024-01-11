import "@styles/globals.css";
import Nav from "@components/Nav";
import Provider from "@components/Provider";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import SessionProvider from "@components/SessionProvider"
import { getServerSession } from "next-auth";
export const metadata = {
  title: "Gitulyse",
  description: "Code reporting and summary",
};
async function Rootlayout({ children }) {
  const session = await getServerSession()

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <SessionProvider session={session}>
          <MantineProvider>
            <div className="app">
              <Nav />
              {children}
            </div>
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
};

export default Rootlayout;
