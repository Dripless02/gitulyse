"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { TextInput } from "@mantine/core";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Nav = () => {
    const { data: session } = useSession();
    const [value, setValue] = useState("");

    return (
        <nav className="flex-between w-full mb-15 pt-3">
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
                    <div className="flex items-center">
                        <TextInput
                            className="pt-4 justify-center pr-96 mr-44"
                            variant="filled"
                            placeholder="Enter Repo URL..."
                            size="xl"
                            radius="60"
                            value={value}
                            onChange={(event) => setValue(event.currentTarget.value)}
                        />

                        <div className="flex items-center gap-3 md:gap-5 ">
                            <button type="button" onClick={() => signOut()} className="outline_btn">
                                Sign Out
                            </button>
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
