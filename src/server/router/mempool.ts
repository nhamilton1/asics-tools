import { createRouter } from "./context";
import mempoolJS from "@mempool/mempool.js";
import { TRPCError } from "@trpc/server";

const URL = "https://mempool.space/api/v1/blocks";

type Blocks = {
  extras: {
    reward: number;
    coinbaseTx: {
      vin: [
        {
          scriptsig: string;
        }
      ];
      vout: [
        {
          scriptpubkey_address: string;
          value: number;
        }
      ];
    };
    coinbaseRaw: string;
    medianFee: number;
    feeRange: number[];
    totalFees: number;
    avgFee: number;
    avgFeeRate: number;
    pool: {
      id: number;
      name: string;
      slug: string;
    };
    matchRate: number;
  };
  id: string;
  height: number;
  version: number;
  timestamp: number;
  bits: number;
  nonce: number;
  difficulty: number;
  merkle_root: string;
  tx_count: number;
  size: number;
  weight: number;
  previousblockhash: string;
}[];

export const mempool = createRouter()
  .query("get-difficulty-adjustment", {
    async resolve() {
      const results: Blocks = await fetch(URL)
        .then((res) => res.json())
        .catch((e) => {
          return new TRPCError({
            code: "NOT_FOUND",
            message: `Error fetching mined blocks. Error: ${e}`,
          });
        });

      const {
        bitcoin: { difficulty },
      } = mempoolJS({
        hostname: "mempool.space",
      });

      const difficultyAdjustment = await difficulty.getDifficultyAdjustment();

      let blockHeight = results[0]?.height ?? 0;

      return { difficultyAdjustment, blockHeight };
    },
  })
  .query("get-mined-blocks", {
    async resolve() {
      const results: Blocks = await fetch(URL)
        .then((res) => res.json())
        .catch((e) => {
          return new TRPCError({
            code: "NOT_FOUND",
            message: `Error fetching mined blocks. Error: ${e}`,
          });
        });

      const minedBlocks = results.map((block) => {
        return {
          height: block.height,
          pool: block.extras.pool.name,
        };
      });

      return minedBlocks;
    },
  });
