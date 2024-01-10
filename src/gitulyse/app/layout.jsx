import "@styles/globals.css";
import Nav from "@components/Nav";
import Provider from "@components/Provider";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
export const metadata = {
  title: "Gitulyse",
  description: "Code reporting and summary",
};
const Rootlayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <div className="app">
            <Nav />
            {children}
          </div>
        </MantineProvider>
      </body>
    </html>
  );
};

export default Rootlayout;
