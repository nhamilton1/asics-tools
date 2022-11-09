import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const TempChart = () => {
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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
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

export default TempChart;
