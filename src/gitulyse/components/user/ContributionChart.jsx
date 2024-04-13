import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import CustomChartTooltip from "@/components/user/CustomChartTooltip";
import { getColour } from "@/components/user/utils";

const ContributionChart = ({ data, largest, userInfo }) => {
    if (data.length === 0) return null;
    return (
        <ResponsiveContainer height={300} width="100%" className="mt-4">
            <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis dataKey="overall" domain={[0, largest]} />
                <Tooltip content={CustomChartTooltip} />
                <Line
                    dataKey="overall"
                    stroke="#8884d8"
                    type="monotone"
                    activeDot={{ r: 8 }}
                    isAnimationActive={false}
                />
                {userInfo.repos.map((repo) => {
                    return (
                        <Line
                            key={repo.name}
                            dataKey={repo.name}
                            type="monotone"
                            stroke={getColour(userInfo.repos.indexOf(repo))}
                            activeDot={{ r: 8 }}
                            isAnimationActive={false}
                            connectNulls
                        />
                    );
                })}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ContributionChart;
