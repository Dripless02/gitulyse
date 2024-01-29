"use client";

import Repos from "@components/Repos";
import Search from "@components/Search";
import { useSession } from "next-auth/react";

const Home = () => {
    const { status } = useSession();

    return (
        <section className="w-full flex-center flex-col">
            <h1 className="head_text text-center pb-5">
                Gitulyse
                <br className="max-md: hidden" />
                <span className="blue_gradient"> Code Summarization and Reporting Tool</span>
            </h1>

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
