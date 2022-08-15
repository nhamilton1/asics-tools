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

      const miner = await ctx.prisma.miner_data.findUnique({
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
            },
          },
        },
      });

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

      return {
        ...miner,
        chartData,
      };
    },
  });
