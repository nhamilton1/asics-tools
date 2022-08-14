import { z } from "zod";
import { createRouter } from "./context";
import { prisma } from "../db/client";

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
      return miner;
    },
  });
