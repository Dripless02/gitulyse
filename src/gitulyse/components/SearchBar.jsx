import {
    Combobox,
    Group,
    Loader,
    SegmentedControl,
    Text,
    TextInput,
    useCombobox,
} from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IconBook2, IconPlus, IconUser } from "@tabler/icons-react";

const SearchBar = ({ userCompare, setUserCompare, dialogStatus, dialogOpen }) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const router = useRouter();

    const [userAccessToken, setUserAccessToken] = useState("");
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [empty, setEmpty] = useState(false);
    const [searchType, setSearchType] = useState("Repo");
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    useEffect(() => {
        async function getInfo() {
            const info = await getSession();
            if (info) {
                setUserAccessToken(info.accessToken);
            }
        }

        getInfo().catch((err) => {
            console.error(err);
        });
    }, []);

    const fetchOptions = useCallback(
        (value) => {
            setLoading(true);

            fetch(
                `${BACKEND_URL}/search?token=${userAccessToken}&query=${value}&type=${searchType}`,
            )
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error("Failed to fetch data");
                    }
                    return res.json();
                })
                .then((data) => {
                    setData(data.results);
                    setLoading(false);
                    setEmpty(data.results.length === 0);
                })
                .catch((e) => {
                    setData([]);
                    setLoading(false);
                    setEmpty(true);
                    console.error(e);
                });
        },
        [BACKEND_URL, searchType, userAccessToken],
    );

    const options = (data || []).map((item) => (
        <Combobox.Option value={item} key={item}>
            <Group gap="sm" justify="space-between">
                <Group
                    onClick={() => {
                        if (item.includes("/")) {
                            router.push(`/repo/${item}`);
                        } else {
                            router.push(`/user/${item}`);
                        }
                        combobox.closeDropdown();
                    }}
                >
                    {item.includes("/") ? <IconBook2 stroke={2} /> : <IconUser stroke={2} />}
                    <Text>{item}</Text>
                </Group>
                {!item.includes("/") &&
                    userCompare.length < 2 &&
                    userCompare.indexOf(item) === -1 && (
                        <IconPlus
                            stroke={2}
                            size={24}
                            onClick={() => {
                                setUserCompare([...userCompare, item]);
                                if (dialogStatus === false) {
                                    dialogOpen();
                                }
                            }}
                            className="hover:text-green-600"
                        />
                    )}
            </Group>
        </Combobox.Option>
    ));

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchOptions(value);
        }, 1000);

        return () => clearTimeout(delayDebounce);
    }, [fetchOptions, value]);

    return (
        <Combobox withinPortal={false} store={combobox}>
            <Combobox.Target>
                <Group gap="sm" className="pr-3 bg-blue-600/65 rounded-l-3xl rounded-r-2xl">
                    <SegmentedControl
                        disabled={loading}
                        orientation="vertical"
                        size="md"
                        radius="lg"
                        value={searchType}
                        onChange={setSearchType}
                        data={["Repo", "User"]}
                        className="border border-orange-500"
                    />
                    <TextInput
                        className="justify-center"
                        variant="filled"
                        placeholder="Enter Repo URL..."
                        size="xl"
                        radius="md"
                        value={value}
                        onChange={(event) => {
                            setValue(event.currentTarget.value);
                            combobox.resetSelectedOption();
                            combobox.openDropdown();
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => {
                            combobox.openDropdown();
                            if (data === null) {
                                fetchOptions(value);
                            }
                        }}
                        onBlur={() => combobox.closeDropdown()}
                        rightSection={loading && <Loader size={18} />}
                    />
                </Group>
            </Combobox.Target>

            <Combobox.Dropdown hidden={data === null || value === ""}>
                <Combobox.Options mah={300} style={{ overflowY: "auto" }}>
                    {options}
                    {empty && value !== "" && <Combobox.Empty>No results found</Combobox.Empty>}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};

export default SearchBar;
