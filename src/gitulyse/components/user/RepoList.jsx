import { Grid } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

const RepoList = ({ repos }) => {
    return (
        <Grid gutter="lg" grow>
            {repos.map((repo) => (
                <Grid.Col key={repo.name} span={{ base: 12, md: 6, lg: 4 }}>
                    <Link
                        href={`/repo/${repo.name}`}
                        target="_self"
                        className="py-1 px-6 w-full h-16 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                    >
                        {repo.name}
                        <IconArrowRight stroke={1.5} />
                    </Link>
                </Grid.Col>
            ))}
        </Grid>
    );
};

export default RepoList;
