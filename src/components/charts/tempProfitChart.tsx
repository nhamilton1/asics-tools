import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "./profitChart";

const TempProfitChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        width={600}
        height={300}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />=
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip content={CustomTooltip} />
        <Legend />
        <Line
          type="monotone"
          dataKey="profitMonth"
          stroke="#82ca9d"
          strokeWidth={4}
          name="Profit per month"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TempProfitChart;
