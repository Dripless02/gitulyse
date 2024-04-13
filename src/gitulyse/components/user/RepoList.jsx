import { Grid } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

const RepoList = ({ repos }) => {
    if (repos === undefined) {
        return (
            <Grid gutter="lg" grow>
                {Array.from({ length: 6 }).map((_, index) => (
                    <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
                        <a
                            href="https://github.com/octocat/Spoon-Knife"
                            target="_blank"
                            className="py-1.5 px-8 w-full h-14 inline-flex items-center justify-between rounded text-xl bg-[#12b88626] text-[#63e6be] hover:bg-[#12b88633]"
                        >
                            octocat/Spoon-Knife
                            <IconArrowRight stroke={1.5} />
                        </a>
                    </Grid.Col>
                ))}
            </Grid>
        );
    }

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
