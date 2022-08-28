import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { LoadingSkeletonNav } from "../loadingSkeletons";

const AsicNavbar = () => {
  const router = useRouter();

  const { data, isLoading } = trpc.useQuery([
    "mempool.get-difficulty-adjustment",
  ]);

  return (
    <div className="w-full p-5 flex flex-row justify-between items-center flex-wrap gap-2">
      <div className="flex flex-row justify-start items-center">
        <h1 className="xl:text-4xl text-2xl font-extrabold text-[#ffffff]">
          {router.pathname === "/" ? (
            "ASIC Tools"
          ) : (
            <Link href={"/"}>ASIC Tools</Link>
          )}
        </h1>
      </div>
      <div className="flex flex-row gap-10 items-start justify-center flex-wrap">
        {isLoading ? (
          <LoadingSkeletonNav />
        ) : (
          <>
            <div className="flex flex-col justify-center items-center text-white">
              {" "}
              Current Block Height:
              <span> {data?.blockHeight}</span>
            </div>

            <div className="flex flex-col justify-center items-center text-white">
              <div>Blocks Remaining</div>
              {!!data?.difficultyAdjustment.remainingBlocks && (
                <span>{data.difficultyAdjustment.remainingBlocks}</span>
              )}
            </div>

            <div className="flex flex-col justify-center items-center text-white">
              <div>Next Adjustment</div>
              {!!data?.difficultyAdjustment.remainingTime && (
                <span>
                  ~
                  {
                    //how many days until next adjustment from milliseconds
                    (
                      (new Date(
                        data.difficultyAdjustment.remainingTime
                      ).getTime() -
                        new Date().getTime()) /
                      1000 /
                      60 /
                      60 /
                      24
                    ).toFixed(0)
                  }{" "}
                  Days
                </span>
              )}
            </div>

            <div className="text-white text-center">
              <div>Difficulty Adjustment</div>
              {!!data?.difficultyAdjustment.difficultyChange &&
              data.difficultyAdjustment.difficultyChange > 0 ? (
                <div className="flex flex-row gap-2 justify-center items-center">
                  <div className="h-0 w-0 border-x-8 border-x-transparent border-b-[16px] border-b-green-600" />
                  <span className="text-white">
                    {data.difficultyAdjustment.difficultyChange.toFixed(2)}%
                  </span>
                </div>
              ) : (
                <div className="flex flex-row gap-2 justify-center items-center">
                  <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[16px] border-t-red-600" />
                  <span className="text-white">
                    {data?.difficultyAdjustment.difficultyChange.toFixed(2)}%
                  </span>
                </div>
              )}
              <div className="flex flex-row justify-center items-center gap-2 text-xs">
                Previous
                {data?.difficultyAdjustment.previousRetarget &&
                data.difficultyAdjustment.previousRetarget > 0 ? (
                  <>
                    <div className="h-0 w-0 border-x-4 border-x-transparent border-b-[8px] border-b-green-600" />
                    <span>
                      {data?.difficultyAdjustment.previousRetarget.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <>
                    <div className="h-0 w-0 border-x-4 border-x-transparent border-t-[8px] border-t-red-600" />
                    <span>
                      {data?.difficultyAdjustment.previousRetarget.toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="flex justify-between mb-1">
                <span className="text-base font-medium text-white dark:text-white">
                  Progress Precent
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5 dark:bg-gray-700 text-center">
                <div
                  className="bg-orange-500 h-2.5 rounded-full"
                  style={{
                    width: `${data?.difficultyAdjustment.progressPercent}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-white dark:text-white">
                {data?.difficultyAdjustment.progressPercent.toFixed(2)}%
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AsicNavbar;
