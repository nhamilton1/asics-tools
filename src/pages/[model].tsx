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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
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
        kaboomracksStats: data.kaboomracksStats,
        minefarmbuyStats: data.minefarmbuyStats,
        upstreamdataStats: data.upstreamdataStats,
        histroicalStats: data.histroicalStats,
        minerPriceHistory: data.minerPriceHistory,
        efficiency: data.efficiency,
        th: data.th,
        watts: data.watts,
        manufacturer: data.manufacturer,
        chartData,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center flex-col">
        <h1 className="text-4xl font-bold">
          <span className="text-white ">Loading...</span>
        </h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{model}</title>
        <meta
          name="description"
          content={`Single ASIC miner information ${model}`}
        />
      </Head>
      <div className="flex flex-col justify-center items-center text-white gap-10 ">
        <div className="flex lg:flex-row flex-col justify-center flex-wrap items-center gap-10 w-full lg:px-10 px-3">
          <div className="flex flex-col w-full sm:max-w-sm">
            <div className="flex flex-row items-center justify-center">
              <div className="w-1/4 h-[1px] bg-white" />
              <h2 className="text-lg font-bold text-center whitespace-nowrap px-1">
                {model}
              </h2>
              <div className="w-full h-[1px] bg-white" />
            </div>
            <ul>
              <li className="py-2 border-b flex flex-row justify-between gap-10">
                th/s: <span>{asicInfo?.th} TH</span>
              </li>
              <li className="py-2 border-b flex flex-row justify-between gap-10">
                efficiency: <span>{asicInfo?.efficiency} W/TH</span>
              </li>
              <li className="py-2 border-b flex flex-row justify-between gap-10">
                watts: <span>{asicInfo?.watts}</span>
              </li>
              <li className="py-2 border-b flex flex-row justify-between gap-10">
                manufacturer: <span>{asicInfo?.manufacturer}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col w-full sm:max-w-sm">
            <div className="flex flex-row items-center justify-center">
              <div className="w-1/4 h-[1px] bg-white" />
              <h2 className="text-lg font-bold text-center whitespace-nowrap px-1">
                Historical Stats
              </h2>
              <div className="w-full h-[1px] bg-white" />
            </div>
            <ul>
              {asicInfo?.histroicalStats.highestPrice.date ? (
                <>
                  <li className="py-2 border-b flex flex-row justify-between gap-10">
                    Average Price:
                    <span>
                      {asicInfo?.histroicalStats.averagePrice.toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        }
                      )}
                    </span>
                  </li>
                  <li className="py-2 border-b flex flex-row justify-between gap-10">
                    Highest Price:
                    <span>
                      {asicInfo.histroicalStats.highestPrice.price.toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        }
                      )}{" "}
                      on{" "}
                      {new Date(
                        asicInfo.histroicalStats.highestPrice.date
                      ).toLocaleDateString("en-US")}
                    </span>
                  </li>
                  <li className="py-2 border-b flex flex-row justify-between gap-10">
                    Lowest Price:
                    <span>
                      {asicInfo.histroicalStats.lowestPrice.price.toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        }
                      )}{" "}
                      on{" "}
                      {new Date(
                        asicInfo.histroicalStats.lowestPrice.date
                      ).toLocaleDateString("en-US")}
                    </span>
                  </li>
                </>
              ) : null}
              <li className="py-2 border-b flex flex-row justify-between gap-10">
                Amount of Times Listed:{" "}
                <span>{asicInfo?.histroicalStats.timesListed}</span>
              </li>
            </ul>
          </div>

          {!!asicInfo?.kaboomracksStats.timesListed && (
            <div className="flex flex-col w-full sm:max-w-sm">
              <div className="flex flex-row items-center justify-center">
                <div className="w-1/4 h-[1px] bg-white" />
                <h2 className="text-lg font-bold text-center whitespace-nowrap px-1">
                  Kaboomracks Stats
                </h2>
                <div className="w-full h-[1px] bg-white" />
              </div>
              <ul>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Average Price:
                  <span>
                    {asicInfo.kaboomracksStats.averagePrice.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Highest Price:
                  <span>
                    {asicInfo.kaboomracksStats.highestListedPrice?.price.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}{" "}
                    on{" "}
                    {asicInfo.kaboomracksStats.highestListedPrice?.date.toLocaleString()}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Lowest Price:
                  <span>
                    {asicInfo.kaboomracksStats.lowestListedPrice?.price.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}{" "}
                    on{" "}
                    {asicInfo.kaboomracksStats.lowestListedPrice?.date.toLocaleString()}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Amount of Times Listed:
                  <span>{asicInfo.kaboomracksStats.timesListed}</span>
                </li>
              </ul>
            </div>
          )}
          {!!asicInfo?.minefarmbuyStats.timesListed && (
            <div className="flex flex-col w-full sm:max-w-sm">
              <div className="flex flex-row items-center justify-center">
                <div className="w-1/4 h-[1px] bg-white" />
                <h2 className="text-lg font-bold text-center whitespace-nowrap px-1">
                  minefarmbuy Stats
                </h2>
                <div className="w-full h-[1px] bg-white" />
              </div>
              <ul>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Average Price:
                  <span>
                    {asicInfo?.minefarmbuyStats.averagePrice.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Highest Price:
                  <span>
                    {asicInfo.minefarmbuyStats.highestListedPrice?.price.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}{" "}
                    on{" "}
                    {asicInfo.minefarmbuyStats.highestListedPrice?.date.toLocaleString()}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Lowest Price:
                  <span>
                    {asicInfo.minefarmbuyStats.lowestListedPrice?.price.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}{" "}
                    on{" "}
                    {asicInfo.minefarmbuyStats.lowestListedPrice?.date.toLocaleString()}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Amount of Times Listed:
                  <span>{asicInfo?.minefarmbuyStats.timesListed}</span>
                </li>
              </ul>
            </div>
          )}
          {!!asicInfo?.upstreamdataStats.timesListed && (
            <div className="flex flex-col w-full sm:max-w-sm">
              <div className="flex flex-row items-center justify-center">
                <div className="w-1/4 h-[1px] bg-white" />
                <h2 className="text-lg font-bold text-center whitespace-nowrap px-1">
                  upsteamdata Stats
                </h2>
                <div className="w-full h-[1px] bg-white" />
              </div>
              <ul>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Average Price:
                  <span>
                    {asicInfo?.upstreamdataStats.averagePrice.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Highest Price:
                  <span>
                    {asicInfo.upstreamdataStats.highestListedPrice?.price.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}{" "}
                    on{" "}
                    {asicInfo.upstreamdataStats.highestListedPrice?.date.toLocaleString()}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Lowest Price:
                  <span>
                    {asicInfo.upstreamdataStats.lowestListedPrice?.price.toLocaleString(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                      }
                    )}{" "}
                    on{" "}
                    {asicInfo.upstreamdataStats.lowestListedPrice?.date.toLocaleString()}
                  </span>
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  Amount of Times Listed:
                  <span>{asicInfo?.upstreamdataStats.timesListed}</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-row flex-wrap w-full h-full">
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
