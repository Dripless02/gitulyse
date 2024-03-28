"use client";

import Calendar from "@components/Calendar";
import Repos from "@components/Repos";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";

const Home = () => {
    const { status } = useSession();

    const [userAccessToken, setUserAccessToken] = useState("");

    useEffect(() => {
        async function getInfo() {
            const info = await getSession();
            if (info) {
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
                <Calendar userAccessToken={userAccessToken} />
                
                <Marquee speed={100}>
                <div>
                    <h1 className="head_text text-center pb-5 bigtext blue_gradient antialiased ">
                        &nbsp;&nbsp;&nbsp;Gitulyse, Analyse your Git Repositories.&nbsp;&nbsp;&nbsp;
                    </h1>
                </div>

                <div>
                    <h1 className="head_text text-center pb-5 bigtext blue_gradient antialiased ">
                        &nbsp;&nbsp;&nbsp;Search for a repository or user to get started.&nbsp;&nbsp;&nbsp;
                    </h1>
                </div>

                <div>
                    <h1 className="head_text text-center pb-5 bigtext blue_gradient antialiased ">
                        &nbsp;&nbsp;&nbsp;Find your own Repos below.&nbsp;&nbsp;&nbsp;
                    </h1>
                </div>
            </Marquee>
                <Repos />
                </>
            ) : (
                <></>
            )}
        </section>
    );
};

export default Home;
