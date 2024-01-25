"use client";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

const Nav = () => {
    const { data: session } = useSession();

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
            <div className="sm:flex hidden">
                {session ? (
                    <div className="flex items-center gap-3 md:gap-5">
                        <button type="button" onClick={() => signOut()} className="outline_btn">
                            Sign Out
                        </button>
                        <p className="text-blue-600">{session.user.name}</p>
                        <Link href="/profile">
                            <Image
                                src="/assets/images/profile.jpg"
                                alt="profile picture"
                                width={50}
                                height={0}
                                className="rounded-full"
                            />
                        </Link>
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
