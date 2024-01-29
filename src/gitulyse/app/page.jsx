import Repos from "@components/Repos";
import Search from "@components/Search";

const Home = () => {
    return (
        <section className="w-full flex-center flex-col">
            <h1 className="head_text text-center pb-5">
                Gitulyse
                <br className="max-md: hidden" />
                <span className="blue_gradient"> Code Summarization and Reporting Tool</span>
            </h1>
            <Search />
            <Repos />
        </section>
    );
};

export default Home;
