import { createRouter } from "./context";

export const marketRouter = createRouter().query("get-all-market", {
  async resolve({ ctx }) {
    const market = await ctx.prisma.market_data.findMany();
    return market;
  },
});
