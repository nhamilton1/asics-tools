import Head from "next/head";
import { useRouter } from "next/router";
import React, { ReactElement } from "react";
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
import AsicLayout from "../components/asicLayout.tsx/asicLayout";
import { trpc } from "../utils/trpc";

const Model = () => {
  const router = useRouter();
  const { model } = router.query;

  const {
    data: asicInfo,
    isLoading,
    error,
  } = trpc.useQuery(["miner.get-miner", model as string], {
    retry: false,
    
  });

  if (isLoading) return <div>Loading...</div>;

  console.log(asicInfo);
  return (
    <>
      <Head>
        <title>{model}</title>
        <meta name="description" content="Single ASIC miner information" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-screen flex flex-col justify-center items-center text-white">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">{model}</h2>
          <ul>
            <li className="py-2 border-b flex flex-row justify-between gap-10">
              th/s: <span>{asicInfo?.th} th</span>
            </li>
            <li className="py-2 border-b flex flex-row justify-between gap-10">
              efficiency: <span>{asicInfo?.efficiency} w/th</span>
            </li>
            <li className="py-2 border-b flex flex-row justify-between gap-10">
              watts: <span>{asicInfo?.watts}</span>
            </li>
          </ul>
        </div>
        {!!asicInfo?.chartData && (
          <ResponsiveContainer width="30%" height="30%">
            <LineChart
              width={200}
              height={200}
              data={asicInfo.chartData}
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
              <Tooltip content={CustomTooltip} />
              <Legend />
              <Line
                type="monotone"
                dataKey="btcPrice"
                stroke="#82ca9d"
                strokeWidth={4}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {isLoading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
      </div>
    </>
  );
};

export default Model;

Model.getLayout = function getLayout(page: ReactElement) {
  return <AsicLayout>{page}</AsicLayout>;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active) {
    return (
      <div className="bg-slate-700 p-2">
        <p className="label">{`${label} : ${
          !!payload && payload[0]?.value
        }`}</p>
      </div>
    );
  }
};
