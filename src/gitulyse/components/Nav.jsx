"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@mantine/core";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import InfoModal from "@/components/infoModal";
import SearchBar from "@/components/SearchBar";

const Nav = () => {
    const { data: session } = useSession();
    const [modalOpened, setModalOpened] = useState(false);

    const toggleModal = () => {
        setModalOpened((prev) => !prev);
    };
    return (
        <nav className="flex-between w-full mb-15 pt-5">
            <Link href="/" className="flex gap-2 flex-center">
                <Image
                    src="/assets/images/logo.png"
                    alt="gitulyse logo"
                    width={70}
                    height={0}
                    className="object-contain"
                />
                <p className="logo_text">Gitulyse</p>
            </Link>
            <div className="sm:flex items-center">
                {session ? (
                    <>
                        <div className="flex items-center gap-3 md:gap-5">
                            <SearchBar />
                            <div className="flex items-center gap-3 md:gap-5 ">
                                <button
                                    type="button"
                                    onClick={() => signOut()}
                                    className="outline_btn"
                                >
                                    Sign Out
                                </button>
                                <div>
                                    <Button onClick={toggleModal}>How?</Button>
                                    <InfoModal opened={modalOpened} onClose={toggleModal} />
                                </div>
                                <p className="text-blue-600">{session.user.name}</p>
                                <Link href={`/user/${session.login}`}>
                                    <Image
                                        src={`${session.user.image}`}
                                        alt="profile picture"
                                        width={50}
                                        height={0}
                                        className="rounded-full"
                                    />
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-3 md:gap-5">
                        <button type="button" onClick={() => signIn()} className="outline_btn">
                            Sign In
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Nav;
