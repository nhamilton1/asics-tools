import { PrismaClient } from "@prisma/client";
import kaboomracksScraper from "./src/utils/asic-queries/kaboomracks-crawler";
import minefarmbuyScraper from "./src/utils/asic-queries/minefarmbuy-crawler";
import upStreamDataCrawler from "./src/utils/asic-queries/upstreamdata-crawler";

const prisma = new PrismaClient();

type allDataType =
  | {
      vendor: string;
      model: string;
      th: number;
      watts: number;
      efficiency: number;
      price: number;
      date: Date;
      id: string;
    }[]
  | undefined;

type minerInfoDupCheckType =
  | {
      model: string;
      th: number;
      watts: number;
      efficiency: number;
    }[]
  | undefined;

type marketInfoDupCheckType =
  | {
      id: string;
      vendor: string;
      model: string;
      price: number;
      date: Date;
    }[]
  | undefined;

const scheduler = async () => {
  console.time("time");

  try {
    const minerInfo = await prisma.miner_data.findMany();
    const marketInfo = await prisma.market_data.findMany();
    const scrapeForMFBData = (await minefarmbuyScraper()) || [];
    const scrapeForUpstreamData = (await upStreamDataCrawler()) || [];
    const scrapeForKaboomData = (await kaboomracksScraper()) || [];

    let allData: allDataType;

    let minerInfoDupCheck: minerInfoDupCheckType;

    let marketInfoDupCheck: marketInfoDupCheckType;

    //combine all three scrapers into one array.
    allData = [
      ...scrapeForKaboomData,
      ...scrapeForMFBData,
      ...scrapeForUpstreamData,
    ];

    //comparing between allData and minerInfo to see if there are any duplicate models.
    minerInfoDupCheck = allData?.filter(
      (scapeData) =>
        !minerInfo.find((allAsicData) => scapeData.model === allAsicData.model)
    );

    marketInfoDupCheck = allData?.filter(
      (scapeData) =>
        !marketInfo.find((allAsicData) => scapeData.id === allAsicData.id)
    );

    if (minerInfoDupCheck.length > 0) {
      const minerInfo = minerInfoDupCheck?.map((x) => ({
        model: x.model,
        th: x.th,
        watts: x.watts,
        efficiency: x.efficiency,
      }));
      console.log("miner info", minerInfo);
      await prisma.miner_data.createMany({
        data: minerInfo.map((x) => ({
          model: x.model,
          th: x.th,
          watts: x.watts,
          efficiency: x.efficiency,
        })),
      });
    }

    if (marketInfoDupCheck.length > 0) {
      const marketInfo = marketInfoDupCheck?.map((x) => ({
        id: x.id,
        vendor: x.vendor,
        model: x.model,
        price: x.price,
        date: x.date,
      }));
      console.log("market info", marketInfo);
      await prisma.market_data.createMany({
        data: marketInfo.map((x) => ({
          id: x.id,
          vendor: x.vendor,
          model: x.model,
          price: x.price,
          date: x.date,
        })),
      });
    }
  } catch (err) {
    console.error("error in scheduler file", err);
  }
  console.timeEnd("time");
  console.log(new Date().toLocaleString());
};

scheduler()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
