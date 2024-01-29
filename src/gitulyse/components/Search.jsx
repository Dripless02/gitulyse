"use client";
import { Center, TextInput } from "@mantine/core";
import { useState } from "react";

const Search = () => {
    const [value, setValue] = useState("");
    return (
        <Center>
            <TextInput
                className="pt-40"
                variant="filled"
                placeholder="Enter Repo URL..."
                size="xl"
                radius="20"
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
            />
        </Center>
    );
};

export default Search;
