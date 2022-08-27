import Link from "next/link";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

const AsicNavbar = () => {
  const router = useRouter();

  const { data } = trpc.useQuery(["mempool.get-difficulty-adjustment"]);

  return (
    <div className="w-full p-5 flex flex-row justify-between items-center">
      <div className="flex flex-row justify-start items-center">
        <h1 className="xl:text-4xl text-2xl font-extrabold text-[#ffffff]">
          {router.pathname === "/" ? (
            "ASIC Tools"
          ) : (
            <Link href={"/"}>ASIC Tools</Link>
          )}
        </h1>
      </div>
      <div className="flex flex-row gap-10 items-center justify-center">
        <div className="text-white text-center">
          <div>Difficulty Adjustment</div>
          {!!data?.difficultyChange && data.difficultyChange > 0 ? (
            <div className="flex flex-row gap-2 justify-center items-center">
              <div className="h-0 w-0 border-x-8 border-x-transparent border-b-[16px] border-b-green-600" />
              <span className="text-white">
                {data.difficultyChange.toFixed(2)}%
              </span>
            </div>
          ) : (
            <div className="flex flex-row gap-2 justify-center items-center">
              <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[16px] border-t-red-600" />
              <span className="text-white">
                {data?.difficultyChange.toFixed(2)}%
              </span>
            </div>
          )}
          <div className="flex flex-row justify-center items-center gap-2 text-sm">
            Previous
            {data?.previousRetarget && data.previousRetarget > 0 ? (
              <>
                <div className="h-0 w-0 border-x-4 border-x-transparent border-b-[8px] border-b-green-600" />
                <span>{data?.previousRetarget.toFixed(2)}%</span>
              </>
            ) : (
              <>
                <div className="h-0 w-0 border-x-4 border-x-transparent border-t-[8px] border-t-red-600" />
                <span>{data?.previousRetarget.toFixed(2)}%</span>
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
          <div className="w-full bg-slate-900 rounded-full h-2.5 dark:bg-gray-700 text-center">
            <div
              className="bg-orange-600 h-2.5 rounded-full"
              style={{ width: `${data?.progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-medium text-white dark:text-white">
            {data?.progressPercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default AsicNavbar;
