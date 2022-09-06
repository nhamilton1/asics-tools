import { trpc } from "../utils/trpc";
import { LoadingSkeletonTicker } from "./loadingSkeletons";
import Image from "next/image";
import f2pool from "../public/images/f2pool.svg";
import antpool from "../public/images/antpool.svg";
import poolin from "../public/images/poolin.svg";
import btccom from "../public/images/btccom.svg";
import binancepool from "../public/images/binancepool.svg";
import emcdpool from "../public/images/emcdpool.svg";
import foundryusa from "../public/images/foundryusa.svg";
import kucoinpool from "../public/images/kucoinpool.svg";
import luxor from "../public/images/luxor.svg";
import marapool from "../public/images/marapool.svg";
import sbicrypto from "../public/images/sbicrypto.svg";
import slushpool from "../public/images/slushpool.svg";
import viabtc from "../public/images/viabtc.svg";
import unknown from "../public/images/unknown.svg";

const MinedBlocksTicker = () => {
  const { data: minedBlocks, isLoading: isLoadingMinedBlocks } = trpc.useQuery(
    ["mempool.get-mined-blocks"],
    {
      cacheTime: 10000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      {isLoadingMinedBlocks ? (
        <div className="relative flex overflow-x-hidden w-full items-center justify-center mr-5 rounded-full">
          <LoadingSkeletonTicker />
        </div>
      ) : (
        <div className="relative flex overflow-x-hidden w-full items-center justify-center mr-5 rounded-full">
          {!!minedBlocks && (
            <div className="animate-marquee whitespace-nowrap">
              {minedBlocks.map((block, index) => (
                <span className="mx-4 text-lg" key={block.height}>
                  {index + 1}. Block {block.height}: {block.pool}{" "}
                  <Image
                    src={getPoolLogo(block.pool)}
                    alt="F2Pool"
                    width={24}
                    height={24}
                    layout="fixed"
                    priority={true}
                  />
                </span>
              ))}
            </div>
          )}

          {!!minedBlocks && (
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap">
              {minedBlocks.map((block, index) => (
                <span className="mx-4 text-lg" key={block.height}>
                  {index + 1}. Block {block.height}: {block.pool}{" "}
                  <Image
                    src={getPoolLogo(block.pool)}
                    alt="F2Pool"
                    width={24}
                    height={24}
                    layout="fixed"
                    priority={true}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MinedBlocksTicker;

const getPoolLogo = (pool: string) => {
  switch (pool) {
    case "F2Pool":
      return f2pool.src;
    case "AntPool":
      return antpool.src;
    case "Poolin":
      return poolin.src;
    case "BTC.com":
      return btccom.src;
    case "Binance Pool":
      return binancepool.src;
    case "EMCD Pool":
      return emcdpool.src;
    case "Foundry USA":
      return foundryusa.src;
    case "KuCoin Pool":
      return kucoinpool.src;
    case "Luxor":
      return luxor.src;
    case "MaraPool":
      return marapool.src;
    case "SBI Crypto":
      return sbicrypto.src;
    case "SlushPool":
      return slushpool.src;
    case "ViaBTC":
      return viabtc.src;
    default:
      return unknown.src;
  }
};
