const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip bg-neutral-900/90 p-4">
                <p className="label text-white underline font-bold">{label}</p>
                <ul>
                    {payload.map((entry, index) => {
                        if (entry.dataKey === "overall") {
                            return (
                                <li key={`item-${index}`} style={{ color: entry.color }}>
                                    Overall: {entry.value}
                                </li>
                            );
                        }
                        if (entry.value === 0) {
                            return;
                        }
                        return (
                            <li key={`item-${index}`} style={{ color: entry.color }}>
                                {entry.name}: {entry.value}
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
};
export default CustomChartTooltip;
