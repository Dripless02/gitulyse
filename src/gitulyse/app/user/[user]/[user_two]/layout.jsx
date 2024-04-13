export async function generateMetadata({ params }) {
    return {
        title: `Comparing ${params.user} and ${params.user_two}`,
        description: `Comparison of GitHub accounts between ${params.user} and ${params.user_two}`,
    };
}

export default function RepoLayout({ children }) {
    return <section>{children}</section>;
}
