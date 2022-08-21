import { z } from "zod";
import { createRouter } from "./context";
import { prisma } from "../db/client";
import { TRPCError } from "@trpc/server";

interface btcPriceRange {
  next_page_token: string;
  next_page_url: string;
  data: {
    asset: string;
    ReferenceRate: string;
    time: string;
  }[];
}

export const minerRouter = createRouter()
  .query("get-all-miners", {
    async resolve({ ctx }) {
      const miners = await ctx.prisma.miner_data.findMany();
      return miners;
    },
  })
  .query("get-miner", {
    input: z.string().refine(async (model) => {
      console.log("model before edit", model);
      model = model.includes("J th") ? model.replace("J th", "J/th") : model;
      console.log("model after edit", model);

      const miner = await prisma.miner_data.findUnique({
        where: {
          model,
        },
      });
      return !!miner;
    }),
    async resolve({ ctx, input }) {
      const model = input.includes("J th")
        ? input.replace("J th", "J/th")
        : input;

      const miner: {
        model: string;
        efficiency: number;
        th: number;
        watts: number;
        market_data: {
          price: number;
          vendor: string;
          date: Date | string;
        }[];
      } | null = await ctx.prisma.miner_data.findUnique({
        where: {
          model,
        },
        select: {
          model: true,
          efficiency: true,
          th: true,
          watts: true,
          market_data: {
            select: {
              price: true,
              vendor: true,
              date: true,
            },
          },
        },
      });

      if (!miner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Miner not found",
        });
      }

      const hashRateStats =
        "https://insights.braiins.com/api/v1.0/hash-rate-stats";

      const hashRate: {
        avg_fees_per_block: number;
        current_hashrate: number;
        fees_percent: number;
        hash_price: number;
        hash_rate_30: number;
        hash_value: number;
        rev_usd: number;
      } = await fetch(hashRateStats)
        .then((res) => res.json())
        .catch((e) => {
          console.log("catch log", e);
          return {
            error: e.message as string,
          };
        });

      let currentHash = hashRate.current_hashrate;

      const getBtcPriceRange = await fetch(
        "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=btc&metrics=ReferenceRate&frequency=1d&pretty=true"
      ).catch((err) => {
        console.log(err);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "failed to fetch btc price range",
        });
      });

      let { data: btcPriceRange }: btcPriceRange =
        await getBtcPriceRange.json();
      // we are removing the last value, today's date, bec its inaccurate in the api
      btcPriceRange.pop();

      // remove all dates that are not within the last month
      btcPriceRange = btcPriceRange.filter(
        (date) =>
          new Date(date.time).getTime() >
          new Date(new Date().getTime() - 90 * 24 * 60 * 60 * 1000).getTime()
      );

      const chartData: {
        btcPrice: number;
        date: string;
      }[] = [];

      btcPriceRange.forEach((x) => {
        chartData.push({
          btcPrice: Number(Number(x.ReferenceRate).toFixed(2)),
          date: new Date(x.time).toLocaleDateString(),
        });
      });

      const historyLowestPrice:
        | {
            price: number;
            vendor: string;
            date: Date | string;
          }
        | undefined = miner.market_data.sort(
        (
          a: { price: number; vendor: string },
          b: { price: number; vendor: string }
        ) => {
          return a.price - b.price;
        }
      )[0];

      const historyHighestPrice:
        | {
            price: number;
            vendor: string;
            date: Date | string;
          }
        | undefined = miner.market_data.sort(
        (
          a: { price: number; vendor: string },
          b: { price: number; vendor: string }
        ) => {
          return b.price - a.price;
        }
      )[0];

      if (!historyHighestPrice || !historyLowestPrice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Miner not found",
        });
      }

      const minerPriceHistory = miner.market_data
        .map((x) => {
          return {
            price: x.price,
            vendor: x.vendor,
            date: new Date(x.date).toLocaleDateString(),
          };
        })
        .sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

      const amountOfTimesListed = minerPriceHistory.length;

      return {
        ...miner,
        chartData,
        currentHash,
        historyLowestPrice,
        historyHighestPrice,
        minerPriceHistory,
        amountOfTimesListed,
      };
    },
  });
