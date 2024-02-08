"use client";

import Repos from "@components/Repos";
import Search from "@components/Search";
import { useSession } from "next-auth/react";
import Marquee from "react-fast-marquee";

const Home = () => {
    const { status } = useSession();

    return (
        <section className="w-full flex-center flex-col">
            <Marquee speed={100}>
                <div>
                    <h1 className="head_text text-center pb-5 bigtext blue_gradient antialiased ">
                        &nbsp;&nbsp;&nbsp;Gitulyse, Analyse your Git Repositories.&nbsp;&nbsp;&nbsp;
                    </h1>
                </div>

                <div>
                    <h1 className="head_text text-center pb-5 bigtext blue_gradient antialiased ">
                        &nbsp;&nbsp;&nbsp;Seearch for a repository or user to get started.&nbsp;&nbsp;&nbsp;
                    </h1>
                </div>

                <div>
                    <h1 className="head_text text-center pb-5 bigtext blue_gradient antialiased ">
                        &nbsp;&nbsp;&nbsp;Find your own Repos below.&nbsp;&nbsp;&nbsp;
                    </h1>
                </div>
            </Marquee>

            {status === "authenticated" ? (
                <>
                    <Search />
                    <Repos />
                </>
            ) : (
                <></>
            )}
        </section>
    );
};

export default Home;
