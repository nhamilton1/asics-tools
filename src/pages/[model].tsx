import Head from "next/head";
import { useRouter } from "next/router";
import React, { ReactElement, useState } from "react";
import AsicLayout from "../components/asicLayout.tsx/asicLayout";
import { LoadingSkeletonCard } from "../components/loadingSkeletons";
import { trpc } from "../utils/trpc";
import dynamic from "next/dynamic";

const MinerPriceHistoryChart = dynamic(
  () => import("../components/charts/minerPriceHistoryChart"),
  { ssr: false }
);

const TempChart = dynamic(() => import("../components/charts/tempChart"), {
  ssr: false,
});

const TempProfitChart = dynamic(
  () => import("../components/charts/tempProfitChart"),
  {
    ssr: false,
  }
);

const ProfitChart = dynamic(() => import("../components/charts/profitChart"), {
  ssr: false,
});

// export async function getStaticProps() {
//   const ssg = createSSGHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//     transformer: superjson,
//   });

//   await ssg.fetchQuery("asics.get-asics-info");

//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//     },
//     revalidate: 1,
//   };
// }

// export const getStaticPaths: GetStaticPaths = async () => {
//   const prisma = new PrismaClient();
//   const asics = await prisma?.market_data.findMany({
//     select: {
//       model: true,
//     },
//   });

//   if (!asics) {
//     return {
//       paths: [],
//       fallback: true,
//     };
//   } else {
//     return {
//       paths: asics.map((asic) => ({
//         params: {
//           model: asic.model,
//         },
//       })),
//       // https://nextjs.org/docs/basic-features/data-fetching#fallback-blocking
//       fallback: "blocking",
//     };
//   }
// };

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
        {isLoading ? (
          <LoadingSkeletonCard />
        ) : (
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
        )}

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
          {isLoading && <TempProfitChart />}
          {!!asicInfo?.chartData && (
            <ProfitChart chartData={asicInfo.chartData} />
          )}

          {isLoading && <TempChart />}
          {!!asicInfo?.minerPriceHistory && (
            <MinerPriceHistoryChart data={asicInfo.minerPriceHistory} />
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
