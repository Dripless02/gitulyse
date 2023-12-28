"use client";
import Link from 'next/link';
import Image from 'next/image';
import {useState, useEffect} from 'react';
// import {signIn, signOut, useSession, getproviders} from 'next-auth/react';

const Nav = () => {
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

        </div>

    </nav>
  )
}

export default Nav