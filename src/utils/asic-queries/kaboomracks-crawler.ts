import { load } from "cheerio";
import { sha1 } from "../helpers";
import { asicWattList } from "./asicWattList";

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

type wattListType = {
  "Bitmain Antminer S9": { [key: number | string]: number };
  "Bitmain Antminer S19 Pro": { [key: number | string]: number };
  "Bitmain Antminer S19j Pro": { [key: number | string]: number };
  "Bitmain Antminer S19j": { [key: number | string]: number };
  "Bitmain Antminer S19": { [key: number | string]: number };
  "Bitmain Antminer S19a": { [key: number | string]: number };
  "Bitmain Antminer S19a Pro": { [key: number | string]: number };
  "Bitmain Antminer S19 XP": { [key: number | string]: number };
  "Whatsminer M50": { [key: number | string]: number };
  "Whatsminer M30S": { [key: number | string]: number };
  "Whatsminer M31S": { [key: number | string]: number };
  "Whatsminer M31S+": { [key: number | string]: number };
  "Whatsminer M30s+": { [key: number | string]: number };
  "Whatsminer M30S++": { [key: number | string]: number };
  "Whatsminer M21s": { [key: number | string]: number };
  "Whatsminer M21S": { [key: number | string]: number };
  "Whatsminer M20s": { [key: number | string]: number };
  "Whatsminer M20S": { [key: number | string]: number };
  "Canaan Avalonminer 1066": { [key: number | string]: number };
  "Canaan Avalonminer 1246": { [key: number | string]: number };
  "Canaan Avalonminer 1166": { [key: number | string]: number };
  "Canaan Avalonminer 1166 Pro": { [key: number | string]: number };
  "Canaan Avalonminer 1146": { [key: number | string]: number };
  "Canaan Avalonminer 1146 Pro": { [key: number | string]: number };
};

const kaboomracksScraper = async () => {
  try {
    // const { data } = await axios.get("https://t.me/s/kaboomracks");
    const { data } = await fetch("https://t.me/s/kaboomracks", {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    }).then((res) => res.json());

    const $miner = load(data);

    if ($miner.length === 0) {
      throw new Error("No miner data found");
    }

    const asics: kaboomracksInterface[] = [];

    $miner(
      "body > main > div > section > div > div > div > div.tgme_widget_message_text"
    ).each((_idx, el) => {
      const minerData = $miner(el)?.text() as string;
      console.log(minerData);
      if (!minerData) {
        return;
      }

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

      if (
        //might have to change this so it includes T versions
        minerData?.includes("Antminer S") &&
        individualSales != null &&
        moqTest[0] === 1
      ) {
        let vendor = "Kaboomracks";
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

          // search the nested wattList object for the asicSearchName, if the asicSearchName is found, use the th to find the wattage

          // Object.keys(asicWattList).forEach((key) => {
          //   if (asicWattList[key] === asicSearchName) {
          //     Object.entries(asicWattList[key]).forEach(([key2, value]) => {
          //       if ((key2 as string | number) === th) {
          //         watts = value;
          //       } else if (key2 === "wt") {
          //         watts = value;
          //       }
          //     });
          //   }
          // });

          let watts =
            asicWattList[asicSearchName]![th] !== undefined
              ? (asicWattList[asicSearchName]![th] as number)
              : ((asicWattList[asicSearchName]!["wt"]! * Number(th)) as number);

          //added tofixed, was getting a really long decimal place
          let efficiency = Number((watts / th).toFixed(1));
          let model = `${asicName![0]}T`;
          let id = vendor + model + price + date;

          asics.push({
            vendor,
            model,
            th,
            watts,
            efficiency,
            price,
            date,
            id: sha1(id),
          });
        } else if (asicModel?.includes("(")) {
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

          let watts =
            asicWattList[asicSearchName]![th] !== undefined
              ? (asicWattList[asicSearchName]![th] as number)
              : ((asicWattList[asicSearchName]!["wt"]! * Number(th)) as number);

          let efficiency = watts / th;
          let model = `${asicName}T`;
          let id = vendor + model + price + date;

          asics.push({
            vendor,
            model,
            th,

            watts,
            efficiency,
            price,
            date,
            id: sha1(id),
          });
        }
      }

      if (
        minerData.includes("Whatsminer M") &&
        individualSales != null &&
        moqTest![0] === 1
      ) {
        let vendor = "Kaboomracks";
        let price = Number(
          minerData.match(/(?<=[$]\s*).*?(?=\s*each —)/gs)![0]
        );

        //#TODO: Clean tihs up
        //this is ugly as fuck and its too early to try to clean this up
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

        // date = date instanceof Date && !!date.getDate() ?
        //  new Date (minerData
        //     .match(/(?<=[|]\s+).*?(?=\s+Miners)/gs)![0]
        //     .replace(/[^\x20-\x7E]/g, "")
        //     .split(" ")
        //     .map((day) => (day.includes(",") ? day.slice(0, -3) : day))
        //     .join(" ").split("|")[0]) : new Date()

        date = new Date(new Date(date).toLocaleDateString("en-CA"));

        let asicModel = minerData.match(
          /(?=Whatsminer M\s*).*?(?=\s*for)/gs
        )![0];

        let asicSearchName = minerData
          ?.match(/(?=Whatsminer M\s*).*?(?=\s*T)/gs)![0]
          ?.split(" ")
          ?.slice(0, -1)
          ?.join(" ") as string;

        let th = Number(
          asicModel
            ?.split(" ")
            ?.filter((e) =>
              e?.includes("T") && Number.isInteger(Number(e[0])) ? e[0] : null
            )[0]
            ?.replace("T", "")
        );

        // console.log(asicModel)
        // console.log(asicSearchName)

        const asicName = asicModel?.match(/(?=Whatsminer M\s*).*?(?=\s*T)/gs);

        let watts =
          asicWattList[asicSearchName]![th] !== undefined
            ? (asicWattList[asicSearchName]![th] as number)
            : ((asicWattList[asicSearchName]!["wt"]! * Number(th)) as number);

        let efficiency = watts / th;
        let model = `${asicName![0]}T`;
        let id = vendor + model + price + date;

        asics.push({
          vendor,
          model,
          th,
          watts,
          efficiency,
          price,
          date,
          id: sha1(id),
        });
      }

      if (
        minerData.includes("Canaan A") &&
        individualSales != null &&
        moqTest![0] === 1
      ) {
        let vendor = "Kaboomracks";
        let price = Number(
          minerData.match(/(?<=[$]\s*).*?(?=\s*each —)/gs)![0]
        );

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

          let watts =
            asicWattList[asicSearchName]![th] !== undefined
              ? (asicWattList[asicSearchName]![th] as number)
              : ((asicWattList[asicSearchName]!["wt"]! * Number(th)) as number);

          let efficiency = watts / th;
          let model = `${asicName![0]}T`;
          let id = vendor + model + price + date;

          asics.push({
            vendor,
            model,
            th,

            watts,
            efficiency,
            price,
            date,
            id: sha1(id),
          });
        } else if (!asicModel?.includes("T")) {
          let th = Number(
            minerData?.match(/(?=[ㄴ]\s*).*?(?=\s*Th\/s)/gs)![0]?.split(" ")[1]
          );
          const asicName = minerData
            ? (minerData?.match(/(?=Canaan A\s*).*?(?=\s*for)/gs)![0] as string)
            : "";

          let watts =
            asicWattList[asicSearchName]![th] !== undefined
              ? (asicWattList[asicSearchName]![th] as number)
              : ((asicWattList[asicSearchName]!["wt"]! * Number(th)) as number);

          let efficiency = watts / th;
          let model = asicName;
          let id = vendor + model + price + date;

          asics.push({
            vendor,
            model,
            th,

            watts,
            efficiency,
            price,
            date,
            id: sha1(id),
          });
        }
      }
    });

    //filters for dups
    const ids = asics.map((a) => a.id);
    const filtered = asics.filter(({ id }, idx) => !ids.includes(id, idx + 1));
    return filtered;
  } catch (err) {
    console.error(err);
  }
};
kaboomracksScraper();
export default kaboomracksScraper;
