"use client";
import { useState } from 'react';
import { Center, TextInput } from '@mantine/core';
import {useSession} from "next-auth/react";



const Search = () => {
  const { data: session } = useSession();
  const [value, setValue] = useState('');
  return (
    <div>
    {session ? (
    <Center>
      <TextInput className="pt-40"
        variant="filled"
        placeholder="Enter Repo URL..."
        size="xl"
        radius="20"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        />
      </Center>
    ) : (
        <>
        </>
    )}
    </div>
  )
}

export default Search;