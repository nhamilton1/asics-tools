import { createRouter } from "./context";
import mempoolJS from "@mempool/mempool.js";

export const mempool = createRouter().query("get-difficulty-adjustment", {
  async resolve({ ctx }) {
    const {
      bitcoin: { difficulty },
    } = mempoolJS({
      hostname: "mempool.space",
    });

    const difficultyAdjustment = await difficulty.getDifficultyAdjustment();
    console.log(difficultyAdjustment);
    return difficultyAdjustment;
  },
});
