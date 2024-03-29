import { load } from "cheerio";
import { sha1 } from "../../utils/helpers";
import axios from "axios";
import { asicModelDbCheck } from "../asicModelDbCheck";
import { prisma } from "../../server/db/client";

export interface kaboomracksInterface {
  vendor: string;
  model: string;
  th: number;
  watts: number;
  efficiency: number;
  price: number;
  date: Date;
  id: string;
}

const vendor = "Kaboomracks";

const kaboomracksScraper = async () => {
  console.log("kaboomracks scraper is running");
  /*
  Getting the data from the website
  */
  const minersScrapedFromTelegram: string[] = new Array();
  try {
    const { data } = await axios.get("https://t.me/s/kaboomracks", {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    });

    const $miner = load(data);

    if ($miner.length === 0) {
      throw new Error("No miner data found");
    }
    $miner(
      "body > main > div > section > div > div > div > div.tgme_widget_message_text"
    ).each((_idx, el) => {
      const minerData = $miner(el)?.text() as string;
      minersScrapedFromTelegram.push(minerData);
    });
  } catch (err) {
    console.error(err);
  }

  /*
  Parsing the data
  */

  const asics: kaboomracksInterface[] = new Array();

  for (const minerData of minersScrapedFromTelegram) {
    // this will filter out any posts that do not each in them
    // they sell by lots some times.
    const individualSales = minerData.match(/(?=[—]\s*).*?(?=\s*each —)/gs);
    let moq = minerData.match(/(?=order \s*).*?(?=\s*ship)/g);

    //adding this because it was messing up the regex, had to account for lot
    //tests for outliers for moq
    if (moq === null) {
      moq =
        minerData.match(/(?=each \s*).*?(?<=\s*lot)/g) !== null
          ? minerData.match(/(?=each \s*).*?(?<=\s*lot)/g)
          : minerData.match(/(?=minimum \s*).*?(?<=\s*Contact)/g);
    }

    //TODO: TEST OUT THIS MOQ
    const moqTest =
      moq?.map((ele): (number | null)[] =>
        ele
          .split(" ")
          .map((n: string): number | null => {
            return typeof n === "string" && !Number.isNaN(Number(n))
              ? Number(n)
              : null;
          })
          .filter((i): number | null => i)
      )[0] || [];

    // removes used asics, for now, until I add a column for it in the db and logic
    // is this a good idea? do I add this?
    const isASICNew =
      !!minerData.includes("Used in Good Condition") ||
      !!minerData.includes("#used");

    /*
      ====================== Formatting for Antminers ======================
    */

    if (minerData.includes("XP")) {
      s19XPParser(minerData);
    }

    if (
      //might have to change this so it includes T versions
      isASICNew &&
      minerData?.includes("Antminer S") &&
      individualSales != null &&
      moqTest[0] === 1
    ) {
      //adding price array for when they have multiple prices, takes last one in the array. they striked out a price to show a discount
      let priceArray = !minerData.match(/(?<=[$]\s*).*?(?=\s*each —)/gs)
        ? (minerData
            //had to use this one because they forgot the $ in the price
            .match(/(?<=[—]\s*).*?(?=\s*each —)/gs)![0]
            ?.split(" ") as string[])
        : (minerData
            .match(/(?<=[$]\s*).*?(?=\s*each —)/gs)![0]
            ?.split(" ") as string[]);

      let price = Number(
        priceArray[priceArray.length - 1]?.replace(/[^.\d]/g, "")
      );

      // new way to check for date, if date is not valid it trys a different way
      // usually there are two | which caused it to break
      let date = !isNaN(
        new Date(
          minerData
            ?.match(/(?<=[|]\s+).*?(?=\s+Miners)/gs)![0]
            ?.replace(/[^\x20-\x7E]/g, "")
            ?.split(" ")
            ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
            ?.join(" ") as string
        ).getTime()
      )
        ? new Date(
            new Date(
              minerData
                ?.match(/(?<=[|]\s+).*?(?=\s+Miners)/gs)![0]
                ?.replace(/[^\x20-\x7E]/g, "")
                ?.split(" ")
                ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
                ?.join(" ") as string
            ).toLocaleDateString("en-CA")
          )
        : new Date(
            new Date(
              minerData
                ?.match(/(?<=usa\s+).*?(?=\s+Miners for)/gs)![0]
                ?.replace(/[^\x20-\x7E]/g, "")
                ?.replace("| ", "")
                ?.split(" ")
                ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
                ?.join(" ") as string
            ).toLocaleDateString("en-CA")
          );

      //this will find between the given strings, for exmample here:
      //will find between Antminer S and for
      let asicModel = minerData.match(/(?=Antminer S\s*).*?(?=\s*for)/gs)![0];
      //gets the asic name without the th

      let asicSearchName = minerData
        ?.match(/(?=Bitmain Antminer S\s*).*?(?=\s*T)/gs)![0]
        ?.split(" ")
        ?.slice(0, -1)
        ?.join(" ") as string;

      // console.log(asicModel)
      // console.log(asicSearchName)

      if (asicModel?.includes("T") && !asicModel.includes("(")) {
        let th = Number(
          asicModel
            ?.split(" ")
            ?.filter((e) =>
              e?.includes("T") && Number.isInteger(Number(e[0])) ? e[0] : null
            )[0]
            ?.replace("T", "")
        );

        const asicName = asicModel.match(/(?=Antminer S\s*).*?(?=\s*T)/gs);
        let model = `${asicName![0]}T`;
        let id = sha1(
          vendor + model + price + date.toLocaleDateString("en-CA")
        );

        const addAsicToDb = await asicModelDbCheck(
          asicModel,
          th,
          asicSearchName
        );

        let watts = addAsicToDb.watts;
        let efficiency = addAsicToDb.efficiency;

        const matchedAsicNameInDb = await prisma.miner_data.findFirst({
          where: {
            model,
          },
        });

        if (!matchedAsicNameInDb) {
          console.log(`${model} not found in db`);
          await prisma.miner_data.create({
            data: {
              model,
              th,
              watts,
              efficiency,
            },
          });
        }

        const asicsInfo = {
          vendor,
          model,
          th,
          watts,
          efficiency,
          price,
          date,
          id,
        };
        asics.push(asicsInfo);
      }

      if (asicModel?.includes("(")) {
        //had to add this for inconsistant post with S9s with th like (13.5Th/s)
        //and had to fix how the date was pulled. Still might have to add another
        //statement for when just Th/s is used
        let date = new Date(
          minerData
            ?.match(/(?<=#usa [|]\s+).*?(?=\s+Miners)/gs)![0]
            //removes the invalid chars
            ?.replace(/[^\x20-\x7E]/g, "")
            ?.split(" ")
            ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
            ?.join(" ") as string
        );

        date = new Date(new Date(date).toLocaleDateString("en-CA"));

        let th = Number(
          asicModel
            ?.split(" ")
            ?.filter((e) => e.includes("("))[0]
            ?.replace("(", "")
        );
        const asicName = asicModel
          ?.match(/(?=Antminer S\s*).*?(?=\s*T)/gs)![0]
          ?.replace("(", "");

        const { watts, efficiency } = await asicModelDbCheck(
          asicModel,
          th,
          asicSearchName
        );

        let model = `${asicName}T`;
        let id = sha1(
          vendor + model + price + date.toLocaleDateString("en-CA")
        );

        const matchedAsicNameInDb = await prisma.miner_data.findFirst({
          where: {
            model,
          },
        });

        if (!matchedAsicNameInDb) {
          console.log(`${model} not found in db`);
          await prisma.miner_data.create({
            data: {
              model,
              th,
              watts,
              efficiency,
            },
          });
        }

        const asicsInfo = {
          vendor,
          model,
          th,
          watts,
          efficiency,
          price,
          date,
          id,
        };
        asics.push(asicsInfo);
      }
    }

    /*
      ====================== Formatting for Whatsminers ======================
    */
    if (
      isASICNew &&
      minerData.includes("Whatsminer M") &&
      individualSales != null &&
      moqTest![0] === 1
    ) {
      if (!minerData) throw new Error("No miner data found");

      let price = Number(minerData.match(/(?<=[$]\s*).*?(?=\s*each —)/gs)![0]);

      //#TODO: Clean this up
      let date =
        new Date(
          minerData
            ?.match(/(?<=[|]\s+).*?(?=\s+Miners)/gs)![0]
            ?.replace(/[^\x20-\x7E]/g, "")
            ?.split(" ")
            ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
            ?.join(" ") as string
        ) instanceof Date &&
        !!new Date(
          minerData
            ?.match(/(?<=[|]\s+).*?(?=\s+Miners)/gs)![0]
            ?.replace(/[^\x20-\x7E]/g, "")
            ?.split(" ")
            ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
            ?.join(" ") as string
        ).getDate()
          ? new Date(
              minerData
                ?.match(/(?<=[|]\s+).*?(?=\s+Miners)/gs)![0]
                ?.replace(/[^\x20-\x7E]/g, "")
                ?.split(" ")
                ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
                ?.join(" ")
                ?.split("|")[0] as string
            )
          : new Date();

      date = new Date(new Date(date).toLocaleDateString("en-CA"));

      let asicModel = minerData.match(/(?=Whatsminer M\s*).*?(?=\s*for)/gs)![0];
      if (!asicModel) throw new Error("No asic model found");

      // replacing all logic with this func, lets see how it does
      let asicSearchName = getSearchName(minerData);
      // let asicSearchName = minerData
      //   ?.match(/(?=Whatsminer M\s*).*?(?=\s*T)/gs)![0]
      //   ?.split(" ")
      //   ?.slice(0, -1)
      //   ?.join(" ") as string;

      let th = Number(
        asicModel
          ?.split(" ")
          ?.filter((e) =>
            e?.includes("T") && Number.isInteger(Number(e[0])) ? e[0] : null
          )[0]
          ?.replace("T", "")
      );

      if (!th) {
        th = findTh(minerData);
      }

      let asicName =
        asicModel?.match(/(?=Whatsminer M\s*).*?(?=\s*T)/gs) !== null
          ? asicModel?.match(/(?=Whatsminer M\s*).*?(?=\s*T)/gs)?.toString()
          : `${asicModel} ${th}`;

      if (!asicName) throw new Error("No asic name found");

      if (asicName?.includes("S")) {
        asicName = asicName?.replace("S", "s");
      }

      const { watts, efficiency } = await asicModelDbCheck(
        asicModel,
        th,
        asicSearchName
      );

      let model = `${asicName.length < 0 ? asicName[0] : asicName}T`;

      let id = sha1(vendor + model + price + date.toLocaleDateString("en-CA"));

      const matchedAsicNameInDb = await prisma.miner_data.findFirst({
        where: {
          model,
        },
      });

      if (!matchedAsicNameInDb) {
        console.log(`${model} not found in db`);
        await prisma.miner_data.create({
          data: {
            model,
            th,
            watts,
            efficiency,
          },
        });
      }

      const asicsInfo = {
        vendor,
        model,
        th,
        watts,
        efficiency,
        price,
        date,
        id,
      };
      asics.push(asicsInfo);
    }

    /*
      ====================== Formatting for Canaan ======================
    */

    if (
      isASICNew &&
      minerData.includes("Canaan A") &&
      individualSales != null &&
      moqTest![0] === 1
    ) {
      let price = Number(minerData.match(/(?<=[$]\s*).*?(?=\s*each —)/gs)![0]);

      let date = isNaN(
        new Date(
          minerData
            ?.match(/(?<=[|]\s+).*?(?=\s+Miners)/gs)![0]
            ?.replace(/[^\x20-\x7E]/g, "")
            ?.split(" ")
            ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
            ?.join(" ") as string
        ).getTime()
      )
        ? new Date(
            new Date(
              minerData
                ?.match(/(?<=[|]\s+).*?(?=\s+Miners)/gs)![0]
                ?.replace(/[^\x20-\x7E]/g, "")
                ?.split(" ")
                ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
                ?.join(" ") as string
            ).toLocaleDateString("en-CA")
          )
        : new Date(
            new Date(
              minerData
                ?.match(/(?<=usa\s+).*?(?=\s+Miners for)/gs)![0]
                ?.replace(/[^\x20-\x7E]/g, "")
                ?.replace("| ", "")
                ?.split(" ")
                ?.map((day) => (day.includes(",") ? day.slice(0, -3) : day))
                ?.join(" ") as string
            ).toLocaleDateString("en-CA")
          );

      let asicModel = minerData?.match(/(?=Canaan A\s*).*?(?=\s*for)/gs)![0];
      let asicSearchName = minerData
        ?.match(/(?=Canaan A\s*).*?(?=\s*T)/gs)![0]
        ?.split(" ")
        ?.slice(0, -1)
        ?.join(" ") as string;

      if (asicModel?.includes("T")) {
        let th = Number(
          asicModel
            ?.split(" ")
            ?.filter((e) =>
              e?.includes("T") && Number.isInteger(Number(e[0])) ? e[0] : null
            )[0]
            ?.replace("T", "")
        );

        const asicName = asicModel?.match(/(?=Canaan A\s*).*?(?=\s*T)/gs);

        const { watts, efficiency } = await asicModelDbCheck(
          asicModel,
          th,
          asicSearchName
        );

        let model = `${asicName![0]}T`;
        let id = sha1(
          vendor + model + price + date.toLocaleDateString("en-CA")
        );

        const asicsInfo = {
          vendor,
          model,
          th,
          watts,
          efficiency,
          price,
          date,
          id,
        };
        asics.push(asicsInfo);
      }

      if (!asicModel?.includes("T")) {
        let th = Number(
          minerData?.match(/(?=[ㄴ]\s*).*?(?=\s*Th\/s)/gs)![0]?.split(" ")[1]
        );
        let model = minerData
          ? (minerData?.match(/(?=Canaan A\s*).*?(?=\s*for)/gs)![0] as string)
          : "";

        const { watts, efficiency } = await asicModelDbCheck(
          model,
          th,
          asicSearchName
        );

        let id = sha1(
          vendor + model + price + date.toLocaleDateString("en-CA")
        );

        const asicsInfo = {
          vendor,
          model,
          th,
          watts,
          efficiency,
          price,
          date,
          id,
        };
        asics.push(asicsInfo);
      }
    }
  }

  //filters for dups
  const ids = asics.map((a) => a.id);
  const filtered = asics.filter(({ id }, idx) => !ids.includes(id, idx + 1));
  return filtered;
};

export default kaboomracksScraper;

const findTh = (asicString: string): number => {
  // get Th/s from the string
  const arrayOfTestString = asicString.split(" ");

  const IndexOfTh = arrayOfTestString
    .map((word, index) => (word.includes("Th/s") ? index : null))
    .filter((index) => index !== null)[0];

  if (IndexOfTh === null || !IndexOfTh) throw new Error("Th/s not found");

  // if indexOfTh is not null, then we found Th/s, so the th should be the index before
  const th = arrayOfTestString[IndexOfTh - 1];

  return Number(th);
};

const getSearchName = (asicString: string): string => {
  // get Th/s from the string
  const arrayOfTestString = asicString.split(" ");

  const IndexOfModel = arrayOfTestString
    .map((word, index) => (word.includes("Whatsminer") ? index : null))
    .filter((index) => index !== null)[0];

  if (IndexOfModel === null || !IndexOfModel)
    throw new Error("Whatsminer not found");

  // if indexOfTh is not null, then we found whatsminer, so the model should be the one index after
  const modelType = arrayOfTestString[IndexOfModel + 1];

  if (!modelType) throw new Error("Model type not found");

  const searchName = arrayOfTestString[IndexOfModel] + " " + modelType;

  return searchName;
};

const s19XPParser = (minerString: string) => {
  console.log("====================================");
  console.log(minerString);

  if (!minerString.toLocaleLowerCase().includes("minimum order of 1")) {
    return false;
  }
};
