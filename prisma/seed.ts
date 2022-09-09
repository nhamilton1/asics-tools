import { PrismaClient } from "@prisma/client";
import asics from "./asics.json";
const prisma = new PrismaClient();

const main = async () => {
  console.log("Seeding...");
  console.log(asics.length);

  const minerData = await prisma.miner_data.findMany();

  const missingAsics = asics.filter((asic) => {
    return !minerData.find((miner) => miner.model === asic.model);
  });

  const uniqueMissingMiners = missingAsics.filter(
    (asic, index) =>
      missingAsics.findIndex((t) => t.model === asic.model) === index
  );

  console.log(`Missing ${uniqueMissingMiners.length} miners from db`);
  if (uniqueMissingMiners.length > 0) {
    for (const asic of uniqueMissingMiners) {
      const isAsicInDb = await prisma.miner_data.findUnique({
        where: {
          model: asic.model,
        },
      });

      if (!isAsicInDb) {
        console.log(`Adding ${asic.model} to db`);
        await prisma.miner_data.create({
          data: {
            model: asic.model,
            th: asic.th,
            watts: asic.watts,
            efficiency: asic.efficiency,
          },
        });
      } else {
        console.log(`${asic.model} already exists in db`);
      }
    }
  }

  const marketData = await prisma.market_data.findMany();

  const missingMarketAsics = asics.filter((asic) => {
    return !marketData.find(
      (market) =>
        new Date(market.date).toLocaleDateString("en-US") ===
          new Date(asic.date).toLocaleDateString("en-US") &&
        market.model === asic.model &&
        market.price === asic.price &&
        market.vendor === asic.vendor
    );
  });

  const uniqueMissingMarketAsics = missingMarketAsics.filter(
    (asic, index) =>
      missingMarketAsics.findIndex(
        (t) =>
          t.date === asic.date &&
          t.model === asic.model &&
          t.price === asic.price &&
          t.vendor === asic.vendor
      ) === index
  );

  console.log(`Missing ${uniqueMissingMarketAsics.length} asics from market`);
  if (uniqueMissingMarketAsics.length > 0) {
    for (const market of uniqueMissingMarketAsics) {
      console.log(`Adding ${market.model} to market`);
      await prisma.market_data.create({
        data: {
          vendor: market.vendor,
          price: market.price,
          date: new Date(market.date),
          miner_data: {
            connect: {
              model: market.model,
            },
          },
        },
      });
    }
  }

  console.log("Seeding complete");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
