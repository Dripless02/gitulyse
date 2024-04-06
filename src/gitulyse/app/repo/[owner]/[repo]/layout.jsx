export async function generateMetadata({ params }) {
    return {
        title: `Repo: ${params.owner}/${params.repo}`,
        description: `Code reporting and summary for ${params.owner}/${params.repo}`,
    };
}

export default function RepoLayout({ children }) {
    return <section>{children}</section>;
}
