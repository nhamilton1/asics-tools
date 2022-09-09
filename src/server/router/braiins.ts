import { createRouter } from "./context";

export const braiinsRouter = createRouter().query("get-braiins-info", {
  async resolve() {
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

    if (
      !hashRate.current_hashrate ||
      hashRate.current_hashrate === 0 ||
      hashRate.hash_value === 0 ||
      !hashRate.hash_value
    ) {
      return {
        error: "No hash rate data available from Braiins.",
      };
    } else {
      return true;
    }
  },
});
