import { array, object, z } from "zod";
import { createRouter } from "./context";

export const marketRouter = createRouter()
  .query("get-all-market", {
    async resolve({ ctx }) {
      const market = await ctx.prisma.market_data.findMany();
      return market;
    },
  })
  .mutation("add-markets", {
    input: array(
      object({
        id: z.string(),
        vendor: z.string(),
        model: z.string(),
        price: z.number(),
        date: z.date(),
      })
    ),
    async resolve({ input, ctx }) {
      const market = await ctx.prisma.market_data.createMany({
        data: input.map((x) => ({
          id: x.id,
          vendor: x.vendor,
          model: x.model,
          price: x.price,
          date: x.date,
        })),
      });
      return market;
    },
  });
