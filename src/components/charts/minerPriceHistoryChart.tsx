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

const MinerPriceHistoryChart: React.FC<{
  data: {
    price: number;
    vendor: string;
    date: string;
  }[];
}> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        width={600}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip content={CustomTooltipHistoricalPrice} />
        <Legend />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#FAA219"
          strokeWidth={4}
          dot={false}
          name="Historical ASIC price"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MinerPriceHistoryChart;

const CustomTooltipHistoricalPrice = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active) {
    return (
      <div className="bg-slate-700 p-2 flex flex-col">
        <p>{`asic price: $${
          !!payload &&
          payload[0]?.value?.toLocaleString("en-US", {
            currency: "USD",
          })
        } on ${label} `}</p>
      </div>
    );
  }
};
