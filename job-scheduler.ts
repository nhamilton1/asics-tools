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
    const marketInfo = await prisma.market_data.findMany();
    const scrapeForMFBData = (await minefarmbuyScraper()) || [];
    const scrapeForUpstreamData = (await upStreamDataCrawler()) || [];
    const scrapeForKaboomData = (await kaboomracksScraper()) || [];

    let allData: allDataType;

    let marketInfoDupCheck: marketInfoDupCheckType;

    //combine all three scrapers into one array.
    allData = [
      ...scrapeForKaboomData,
      ...scrapeForMFBData,
      ...scrapeForUpstreamData,
    ];

    // filter out duplicates from the combined array.
    marketInfoDupCheck = allData?.filter(
      (scapeData) =>
        marketInfo?.findIndex((market) => market.id === scapeData.id) === -1
    );
    console.log(marketInfoDupCheck?.length);

    if (marketInfoDupCheck?.length > 0) {
      for (const market of marketInfoDupCheck) {
        console.log(market);
        await prisma.market_data.create({
          data: {
            date: market.date,
            model: market.model,
            vendor: market.vendor,
            price: market.price,
            id: market.id,
          },
        });
      }
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
