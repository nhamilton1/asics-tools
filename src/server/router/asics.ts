import { createRouter } from "./context";
import { prisma } from "../db/client";
import { TRPCError } from "@trpc/server";

export const asicsRouter = createRouter().query("get-asics-info", {
  async resolve() {
    const asics = await prisma.market_data.findMany({
      select: {
        model: true,
        vendor: true,
        price: true,
        id: true,
        date: true,
      },
    });

    const minerInfo = await prisma.miner_data.findMany({
      select: {
        efficiency: true,
        watts: true,
        th: true,
        model: true,
      },
    });

    const asicsWithMinerInfo = asics.map((asic) => {
      const miner = minerInfo.find((x) => x.model === asic.model);
      if (miner) {
        return {
          ...asic,
          th: miner.th,
          watts: miner.watts,
          efficiency: miner.efficiency,
        };
      }
    });

    const btcPriceURL = `https://insights.braiins.com/api/v1.0/price-stats`;

    const btcPrice: { price: number; timestamp: number } = await fetch(
      btcPriceURL
    )
      .then((res) => res.json())
      .catch((e) => {
        console.log("catch log", e);
        return {
          error: e.message as string,
        };
      });

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

    let currentBTCPrice = btcPrice.price;
    let currentHash = hashRate.current_hashrate;
    let currentHashValue = Math.round(hashRate.hash_value * 100000000);
    let currentHashPrice = Number(
      (currentBTCPrice! * currentHashValue * 0.00000001).toFixed(4)
    );
    let elongatedHashPrice = currentHashPrice * 347.22;

    let formattingAsicData = asicsWithMinerInfo.map((a) => {
      if (a?.id) {
        return {
          id: a.id,
          date: new Date(a.date.toISOString().slice(0, -1)).toLocaleDateString(
            "en-US"
          ),
          efficiency: a?.efficiency.toFixed(1),
          model: a.model,
          price: a.price,
          th: a?.th,
          vendor: a.vendor,
          watts: a?.watts,
          currentHashPrice,
          elongatedHashPrice,
        };
      }
    });

    if (!formattingAsicData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No asics found",
      });
    }

    formattingAsicData
      .sort((a, b) => {
        if (a && b) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else {
          return 0;
        }
      })
      .reverse();

    return {
      formattingAsicData,
      currentBTCPrice,
      currentHash,
      currentHashValue,
      currentHashPrice,
      elongatedHashPrice,
    };
  },
});
