import { createRouter } from "./context";
import { prisma } from "../db/client";

export const asicsRouter = createRouter().query("get-asics-info", {
  async resolve() {
    const asics = await prisma.market_data.findMany({
      select: {
        model: true,
        vendor: true,
        price: true,
        id: true,
        date: true,
        miner_data: {
          select: {
            model: true,
            th: true,
            watts: true,
            efficiency: true,
          },
        },
      },
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
    let currentHashValue = Math.round(hashRate.hash_value! * 100000000);
    let currentHashPrice = Number(
      (currentBTCPrice! * currentHashValue * 0.00000001).toFixed(4)
    );
    let elongatedHashPrice = currentHashPrice * 347.22;
    let kWhPrice = 0.12;

    const formattingAsicData = asics?.map((a, idx) => {
      if (a.miner_data) {
        let asicBTCPrice =
          Math.round(1000000 * (a.price / currentBTCPrice!)) / 1000000;
        let value = Math.round(a.price / a.miner_data.th);
        let wattDollar = Number((value * a.miner_data.efficiency).toFixed(0));
        let denverDerivative = Number(
          (wattDollar / elongatedHashPrice).toFixed(2)
        );
        let btcPerMonth =
          Math.round(
            1000000 *
              ((a.miner_data.th / (currentHash! * 1000000)) * 900 * 30.5)
          ) / 1000000;
        let dollarPerMonth = Math.round(btcPerMonth * currentBTCPrice!);
        let monthlyEnergy =
          Math.round(
            100 * (732 * (a.miner_data.watts * 0.001) * Number(kWhPrice))
          ) / 100;
        let profitMonth = Math.round(dollarPerMonth - monthlyEnergy);
        let monthsToRoi = Math.round(100 * (a.price / dollarPerMonth)) / 100;

        return {
          id: a.id,
          date: new Date(a.date).toLocaleDateString("en-US"),
          efficiency: a.miner_data.efficiency.toFixed(1),
          model: a.model,
          price: a.price,
          th: a.miner_data.th,
          vendor: a.vendor,
          watts: a.miner_data.watts,
          asicBTCPrice,
          value,
          wattDollar,
          currentHashPrice,
          elongatedHashPrice,
          denverDerivative,
          btcPerMonth,
          dollarPerMonth,
          monthlyEnergy,
          profitMonth,
          monthsToRoi,
        };
      }
    });
    return formattingAsicData;
  },
});
