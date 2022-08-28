export const LoadingSkeletonNav = () => {
  return (
    <>
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            role="status"
            className="max-w-sm animate-pulse flex flex-col justify-center items-center mt-2"
          >
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-32"></div>

            <div className="flex items-center mt-4 space-x-3">
              <div>
                <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-16 mb-2"></div>
              </div>
            </div>
            <span className="sr-only">Loading...</span>
          </div>
        ))}
      <div
        role="status"
        className="max-w-sm animate-pulse flex flex-col justify-center items-center mt-2"
      >
        <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-32"></div>

        <div className="flex items-center mt-2 space-x-3">
          <div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-10 mb-2"></div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-16 mb-3"></div>
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
      <div
        role="status"
        className="max-w-sm animate-pulse flex flex-col justify-center items-center mt-2"
      >
        <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 w-32"></div>

        <div className="flex items-center mt-2 space-x-3">
          <div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-20 mb-2"></div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-16 mb-3"></div>
          </div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );
};

export const LoadingSkeletonTicker = () => {
  return (
    <>
      <div className="animate-marquee flex flex-row flex-nowrap">
        {Array(15)
          .fill(0)
          .map((_, i) => (
            <div
              className="h-[21px] bg-gray-200 rounded-full dark:bg-gray-700 w-32 mx-4"
              key={i}
            />
          ))}
      </div>

      <div className="absolute top-0 animate-marquee2 flex flex-row flex-nowrap">
        {Array(15)
          .fill(0)
          .map((_, i) => (
            <div
              className="h-[21px] bg-gray-200 rounded-full dark:bg-gray-700 w-32 mx-4"
              key={i}
            />
          ))}
      </div>
    </>
  );
};

export const LoadingSkeletonTable = () => {
  return (
    <div className="animate-pulse flex flex-col justify-center items-center mt-2">
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-32"></div>
      <div className="flex items-center mt-4 space-x-3">
        <div>
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-16 mb-2"></div>
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const LoadingSkeletonCard = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full gap-10 justify-center items-center">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div
            className="flex flex-col w-full sm:max-w-sm animate-pulse"
            key={i}
          >
            <div>
              <div className="flex flex-row items-center justify-center">
                <div className="w-1/4 h-[1px] bg-white" />
                <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-32 px-1" />
                <div className="w-full h-[1px] bg-white" />
              </div>
              <ul>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-20" />
                  <span className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-16" />
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-20" />
                  <span className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-16" />
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-20" />
                  <span className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-16" />
                </li>
                <li className="py-2 border-b flex flex-row justify-between gap-10">
                  <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-20" />
                  <span className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-16" />
                </li>
              </ul>
            </div>
          </div>
        ))}
    </div>
  );
};
