import { array, object, z } from "zod";
import { createRouter } from "./context";

export const minerRouter = createRouter().query("get-all-miners", {
  async resolve({ ctx }) {
    const miners = await ctx.prisma.miner_data.findMany();
    return miners;
  },
});
// .mutation("add-miners", {
//   input: array(
//     object({
//       model: z.string(),
//       th: z.number(),
//       watts: z.number(),
//       efficiency: z.number(),
//     })
//   ),
//   async resolve({ input, ctx }) {
//     const miners = await ctx.prisma.miner_data.createMany({
//       data: input.map((x) => ({
//         model: x.model,
//         th: x.th,
//         watts: x.watts,
//         efficiency: x.efficiency,
//       })),
//     });
//     return miners;
//   },
// });
