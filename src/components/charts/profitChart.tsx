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

const ProfitChart: React.FC<{
  chartData: {
    date: string;
    btcPrice: number;
    profitMonth: number;
  }[];
}> = ({ chartData }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        width={600}
        height={300}
        data={chartData}
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
          dot={<CustomizedDot />}
          activeDot={<ActiveCustomizedDot />}
          name="Profit per month"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProfitChart;

export const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active) {
    return (
      <div className="bg-slate-700 p-2 flex flex-col">
        <p>BTC Price: {!!payload && payload[0]?.payload.btcPrice}</p>
        <p>{`${label} profit: $${
          !!payload &&
          payload[0]?.value?.toLocaleString("en-US", {
            currency: "USD",
          })
        }`}</p>
      </div>
    );
  }
};

const CustomizedDot = ({ cx, cy, stroke, fill, value }: any) => {
  if (value < 0) {
    return (
      <svg
        x={cx - 4}
        y={cy - 4}
        width={10}
        height={10}
        fill={"red"}
        stroke={stroke}
        strokeWidth={0}
      >
        <circle cx={4} cy={4} r={4} />
      </svg>
    );
  }

  return (
    <svg
      x={cx - 0}
      y={cy - 0}
      width={10}
      height={10}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.0}
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={0} cy={0} r={0} />
    </svg>
  );
};

const ActiveCustomizedDot = ({ cx, cy, stroke, fill, value }: any) => {
  if (value < 0) {
    return (
      <svg
        x={cx - 6}
        y={cy - 6}
        width={10}
        height={10}
        fill={"red"}
        stroke={stroke}
        strokeWidth={0}
      >
        <circle cx={6} cy={6} r={6} />
      </svg>
    );
  }

  return (
    <svg
      x={cx - 0}
      y={cy - 0}
      width={10}
      height={10}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.0}
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={0} cy={0} r={0} />
    </svg>
  );
};
