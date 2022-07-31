import { asicWattList } from "./asic-queries/asicWattList";
import { prisma } from "../server/db/client";

export const asicModelDbCheck = async (
  model: string,
  th: number,
  asicSearchName: string
) => {
  const matchedAsicNameInDb = await prisma.miner_data.findFirst({
    where: {
      model,
    },
    select: {
      efficiency: true,
      watts: true,
    },
  });

  if (!matchedAsicNameInDb) {
    let watts: number | undefined =
      asicWattList[asicSearchName]![th] !== undefined
        ? (asicWattList[asicSearchName]![th] as number)
        : ((asicWattList[asicSearchName]!["wt"]! * Number(th)) as number);

    let efficiency = Number((watts / th).toFixed(1));

    await prisma.miner_data.create({
      data: {
        model,
        efficiency,
        th,
        watts,
      },
    });

    return {
      efficiency,
      watts,
    };
  }

  return {
    efficiency: matchedAsicNameInDb.efficiency,
    watts: matchedAsicNameInDb.watts,
  };
};
