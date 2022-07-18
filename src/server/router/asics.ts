import { createRouter } from "./context";
import { prisma } from "../db/client";

export const asicsRouter = createRouter().query("get-all-asics", {
  async resolve() {
    await prisma.miner_data.findMany({
      select: {
        model: true,
        efficiency: true,
        th: true,
        watts: true,
        market_data: true,
      },
    });
  },
});
