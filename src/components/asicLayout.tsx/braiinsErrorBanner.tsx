import { useState } from "react";
import { trpc } from "../../utils/trpc";

const BraiinsErrorBanner = () => {
  const { data } = trpc.useQuery(["mempool.get-difficulty-adjustment"], {
    staleTime: Infinity,
    retry: false,
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const [showBanner, setShowBanner] = useState(true);

  return (
    <>
      {!!data && (
        <div className={`w-full ${showBanner ? "block" : "hidden"}`}>
          <div className="flex flex-row items-center justify-center w-full h-12 bg-red-500">
            <div className="flex flex-row items-center justify-between w-full h-full text-white">
              <div className="ml-5" />
              <p>Braiins API seems to be down.</p>
              <div
                onClick={() => {
                  setShowBanner(false);
                }}
                className="flex flex-row items-center justify-center w-8 h-8 rounded-full bg-red-600 cursor-pointer hover:bg-red-700 mr-5"
              >
                X
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BraiinsErrorBanner;
