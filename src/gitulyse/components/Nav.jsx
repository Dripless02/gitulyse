"use client";
import Link from 'next/link';
import Image from 'next/image';
import {useState, useEffect} from 'react';
import {signIn, signOut, useSession, getProviders} from 'next-auth/react';

const Nav = () => {
    const isUserLoggedIn = true;
  return (
    <nav className='flex-between w-full mb-15 pt-3'>
        <Link href="/" className='flex gap-2 flex-center'>
            <Image src="/assets/images/logo.png"
                    alt="gitulyse logo"
                    width={70}
                    height={0}
                    className='object-contain'/>
            <p className='logo_text'><h1> Gitulyse </h1></p>

        </Link>
        <div className='sm:flex hidden'>
            {isUserLoggedIn ? (
                <div className = "flex gap-3 md:gap-5">
                    <Link href="/search" className='black_btn'>
                        <p className='nav_text'> Search </p>
                    </Link>

                    <button type='button' onClick={signOut} className='outline_btn'>Sign Out</button>
                    <Link href="/profile">
                        <Image src="/assets/images/profile.jpg"
                        alt="profile picture"
                        width={50}
                        height={0}
                        className='rounded-full'
                            />

                    </Link>
                </div>
            ): (
                <>

                </>
            )}
        </div>

    </nav>
  )
}

export default Nav