"use client";

import Calendar from "@/components/Calendar";
import Repos from "@/components/Repos";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import SearchBar from "@/components/SearchBar";

const Home = () => {
    const { status } = useSession();
    const [user, setUser] = useState();

    const [userAccessToken, setUserAccessToken] = useState("");

    useEffect(() => {
        async function getInfo() {
            const info = await getSession();
            if (info) {
                setUser(info.login);
                setUserAccessToken(info.accessToken);
            }
        }

        getInfo().catch((err) => {
            console.error(err);
        });
    }, []);

    return (
        <section className="w-full flex-center flex-col">
            {status === "authenticated" ? (
                <>
                    <SearchBar />
                    <Calendar userAccessToken={userAccessToken} user={user} />
                    <Repos />
                </>
            ) : (
                <Marquee speed={100} style={{ margin: "30vh auto" }}>
                    <div>
                        <h1 className="text-8xl text-center pb-5 blue_gradient antialiased ">
                            &nbsp;&nbsp;&nbsp;Gitulyse, Analyse your Git
                            Repositories.&nbsp;&nbsp;&nbsp;
                        </h1>
                    </div>

                    <div>
                        <h1 className="text-8xl text-center pb-5  blue_gradient antialiased ">
                            &nbsp;&nbsp;&nbsp;Search for a repository or user, and view their
                            workflow.&nbsp;&nbsp;&nbsp;
                        </h1>
                    </div>

                    <div>
                        <h1 className="text-8xl text-center pb-5 blue_gradient antialiased ">
                            &nbsp;&nbsp;&nbsp;Sign in with your Github to get
                            started.&nbsp;&nbsp;&nbsp;
                        </h1>
                    </div>
                </Marquee>
            )}
        </section>
    );
};

export default Home;
