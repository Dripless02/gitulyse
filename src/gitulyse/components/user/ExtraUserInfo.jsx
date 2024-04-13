import { Text } from "@mantine/core";
import { sortLanguages } from "@/components/user/utils";

const ExtraUserInfo = ({ chartData, userInfo }) => {
    return (
        <div>
            <Text>
                overall largest average contributions per commit: {chartData.largest?.number} in{" "}
                {chartData.largest?.month}
            </Text>
            <Text>number of repos: {userInfo.repos?.length} </Text>
            <Text>
                total commits:{" "}
                {userInfo && userInfo.overall_contributions
                    ? Object.values(userInfo.overall_contributions).reduce(
                          (acc, month) => acc + month.commits,
                          0,
                      )
                    : 0}
            </Text>
            <Text>
                languages used:{" "}
                {userInfo && userInfo.languages
                    ? (console.log("languages", userInfo.languages),
                      sortLanguages(userInfo.languages)
                          .map((lang) => lang.language)
                          .join(", "))
                    : ""}
            </Text>
            <Text>number of pull requests created: {userInfo.pull_request_count}</Text>
        </div>
    );
};

export default ExtraUserInfo;
