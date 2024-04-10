import { Combobox, Loader, TextInput, useCombobox } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { getSession } from "next-auth/react";

const SearchBar = ({}) => {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [userAccessToken, setUserAccessToken] = useState("");
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [empty, setEmpty] = useState(false);
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

            fetch(`${BACKEND_URL}/search?token=${userAccessToken}&query=${value}`)
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error("Failed to fetch data");
                    }
                    return res.json();
                })
                .then((data) => {
                    const combined_results = [data.repos, data.users].flat();
                    setData(combined_results);
                    setLoading(false);
                    setEmpty(combined_results.length === 0);
                })
                .catch((e) => {
                    setData([]);
                    setLoading(false);
                    setEmpty(true);
                    console.error(e);
                });
        },
        [BACKEND_URL, userAccessToken],
    );

    const options = (data || []).map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchOptions(value);
        }, 1000);

        return () => clearTimeout(delayDebounce);
    }, [fetchOptions, value]);

    return (
        <Combobox
            onOptionSubmit={(option) => {
                setValue(option);
                combobox.closeDropdown();
            }}
            withinPortal={false}
            store={combobox}
        >
            <Combobox.Target>
                <TextInput
                    className="justify-center pr-4"
                    variant="filled"
                    placeholder="Enter Repo URL..."
                    size="xl"
                    radius="60"
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
            </Combobox.Target>

            <Combobox.Dropdown hidden={empty}>
                <Combobox.Options mah={300} style={{ overflowY: "auto" }}>
                    {options}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};

export default SearchBar;
