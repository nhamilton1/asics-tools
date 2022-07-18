// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { asicsRouter } from "./asics";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("asics.", asicsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
