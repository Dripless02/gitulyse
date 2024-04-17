"use client";
import {signIn, signOut, useSession} from "next-auth/react";
import {Button} from "@mantine/core";
import {useState} from "react";
import Image from "next/image";
import Link from "next/link";
import InfoModal from "@/components/infoModal";
import SearchBar from "@/components/SearchBar";
import UserCompareDialog from "@/components/UserCompareDialog";
import {useDisclosure} from "@mantine/hooks";

const Nav = () => {
    const {data: session} = useSession();
    const [modalOpened, setModalOpened] = useState(false);
    const [userCompare, setUserCompare] = useState([]);
    const [
        userCompareDialogOpened,
        {open: userCompareDialogOpen, close: userCompareDialogClose},
    ] = useDisclosure(false);

    const toggleModal = () => {
        setModalOpened(!modalOpened);
    };

    return (
        <nav className="w-full mb-15 pt-5 flex justify-between items-center">
            <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/assets/images/light-logo.png"
                        alt="gitulyse logo"
                        width={70}
                        height={50}
                        className="object-contain"
                    />
                    <p className="logo_text">Gitulyse</p>
                </Link>
            </div>
            {session ? (
                <>
                    <div className="flex ml-56 items-center justify-center flex-grow">
                        <SearchBar
                            className="justify-content-center"
                            userCompare={userCompare}
                            setUserCompare={setUserCompare}
                            dialogOpen={userCompareDialogOpen}
                            dialogStatus={userCompareDialogOpened}
                            dialogClose={userCompareDialogClose}
                        />
                    </div>
                    <UserCompareDialog
                        users={userCompare}
                        setUsers={setUserCompare}
                        opened={userCompareDialogOpened}
                        close={userCompareDialogClose}
                    />
                    <div className="flex items-center gap-3 md:gap-5">
                        <button type="button" onClick={() => signOut()} className="outline_btn">
                            Sign Out
                        </button>
                        <div>
                            <Button onClick={toggleModal}>How?</Button>
                            <InfoModal opened={modalOpened} onClose={toggleModal}/>
                        </div>
                        <p className="text-blue-600">{session.user.name}</p>
                        <Link href={`/user/${session.login}`}>
                            <Image
                                src={`${session.user.image}`}
                                alt="profile picture"
                                width={50}
                                height={50}
                                className="rounded-full"
                            />
                        </Link>
                    </div>
                </>
            ) : (
                <div className="">
                    <button type="button" onClick={() => signIn()} className="outline_btn">
                        Sign In
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Nav;

