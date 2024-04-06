export async function generateMetadata({ params }) {
    return {
        title: `User: ${params.user}`,
        description: `Code reporting and summary for ${params.user}`,
    };
}

export default function RepoLayout({ children }) {
    return <section>{children}</section>;
}
