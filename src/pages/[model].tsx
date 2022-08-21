import Head from "next/head";
import { useRouter } from "next/router";
import React, { ReactElement, useState } from "react";
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
  const localStorage =
    typeof window !== `undefined` ? window.localStorage : null;
  const router = useRouter();
  const { model } = router.query;
  const [kWhPrice, setKWhPrice] = useState<number>(
    Number(localStorage?.getItem("kWhPrice")) || 0.12
  );

  const {
    data: asicInfo,
    isLoading,
    error,
  } = trpc.useQuery(["miner.get-miner", model as string], {
    retry: false,
    select: (data) => {
      const chartData = data.chartData.map((item) => {
        let btcPerMonth =
          Math.round(
            1000000 * ((data.th / (data.currentHash * 1000000)) * 900 * 30.5)
          ) / 1000000;
        let dollarPerMonth = Math.round(btcPerMonth * item.btcPrice);
        let monthlyEnergy =
          Math.round(100 * (732 * (data?.watts * 0.001) * Number(kWhPrice))) /
          100;
        let profitMonth = Math.round(dollarPerMonth - monthlyEnergy);

        return {
          date: item.date,
          btcPrice: item.btcPrice,
          profitMonth,
        };
      });

      return {
        amountOfTimesListed: data.amountOfTimesListed,
        minerPriceHistory: data.minerPriceHistory,
        historyHighestPrice: data.historyHighestPrice,
        historyLowestPrice: data.historyLowestPrice,
        efficiency: data.efficiency,
        th: data.th,
        watts: data.watts,
        chartData,
      };
    },
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
      <div className="flex flex-col justify-center items-center text-white gap-10">
        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-center">
            <div className="w-1/4 h-[1px] bg-white" />
            <h2 className="text-lg font-bold text-center whitespace-nowrap px-1">
              {model}
            </h2>
            <div className="w-full h-[1px] bg-white" />
          </div>
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
            {asicInfo?.historyHighestPrice.date ? (
              <>
                <li className="py-2 border-b flex flex-row justify-between gap-6">
                  Highest Price:
                  <span>
                    {asicInfo.historyHighestPrice.price.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}{" "}
                    on{" "}
                    {new Date(
                      asicInfo.historyHighestPrice.date
                    ).toLocaleDateString("en-US")}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-6">
                  Lowest Price:
                  <span>
                    {asicInfo.historyLowestPrice.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}{" "}
                    on{" "}
                    {new Date(
                      asicInfo.historyLowestPrice.date
                    ).toLocaleDateString("en-US")}
                  </span>
                </li>
              </>
            ) : null}
            <li className="py-2 border-b flex flex-row justify-between gap-10">
              Amount of Times Listed:{" "}
              <span>{asicInfo?.amountOfTimesListed}</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-row flex-wrap w-full h-full">
          {!!asicInfo?.chartData && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                width={600}
                height={300}
                data={asicInfo.chartData}
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
          )}

          {!!asicInfo?.minerPriceHistory && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                width={600}
                height={300}
                data={asicInfo?.minerPriceHistory}
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
          )}
        </div>

        <div className="flex flex-row justify-center items-center gap-2 mb-2">
          <label>
            <span className="text-white">Enter your kWh Price: </span>
          </label>
          <input
            type={"number"}
            className={"w-2/12 px-1 bg-slate-800 text-white border"}
            value={kWhPrice}
            step={0.01}
            onChange={(e) => {
              let kWh = Number(e.target.value);
              localStorage?.setItem("kWhPrice", kWh.toString());
              setKWhPrice(kWh);
            }}
          />
        </div>
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
