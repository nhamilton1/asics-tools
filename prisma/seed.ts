import { PrismaClient } from "@prisma/client";
import asics from "./asics.json";
const prisma = new PrismaClient();

const main = async () => {
  console.log("Seeding...");
  console.log(asics.length);

  const minerData = await prisma.miner_data.findMany();
  const marketData = await prisma.market_data.findMany();

  const missingAsics = asics.filter((asic) => {
    return !minerData.find((miner) => miner.model === asic.model);
  });

  const uniqueMissingAsics = missingAsics.filter(
    (asic, index) =>
      missingAsics.findIndex((t) => t.model === asic.model) === index
  );

  console.log(`Missing ${uniqueMissingAsics.length} asics`);
  if (uniqueMissingAsics.length > 0) {
    await prisma.miner_data.createMany({
      data: uniqueMissingAsics.map((asics) => ({
        model: asics.model,
        watts: asics.watts,
        efficiency: asics.efficiency,
        th: asics.th,
      })),
    });
  }

  const missingMarketAsics = asics.filter((asic) => {
    return !marketData.find(
      (market) =>
        market.id === asic.date &&
        market.model === asic.model &&
        market.price === asic.price &&
        asic.vendor === market.vendor
    );
  });

  const uniqueMissingMarketAsics = missingMarketAsics.filter(
    (asic, index) =>
      missingMarketAsics.findIndex(
        (t) =>
          t.date === asic.date &&
          t.model === asic.model &&
          t.price === asic.price &&
          asic.vendor === t.vendor
      ) === index
  );

  console.log(`Missing ${uniqueMissingMarketAsics.length} asics`);
  if (uniqueMissingMarketAsics.length > 0) {
    await prisma.market_data.createMany({
      data: uniqueMissingMarketAsics.map((market) => ({
        date: new Date(market.date),
        model: market.model,
        vendor: market.vendor,
        price: market.price,
      })),
    });
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
