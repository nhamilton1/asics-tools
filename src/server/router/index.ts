// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { asicsRouter } from "./asics";
import { marketRouter } from "./market";
import { minerRouter } from "./miner";
import { mempool } from "./mempool";
import { braiinsRouter } from "./braiins";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("asics.", asicsRouter)
  .merge("market.", marketRouter)
  .merge("miner.", minerRouter)
  .merge("mempool.", mempool)
  .merge("braiins.", braiinsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
