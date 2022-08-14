import Head from "next/head";
import { useRouter } from "next/router";
import React, { ReactElement } from "react";
import AsicLayout from "../components/asicLayout.tsx/asicLayout";
import { trpc } from "../utils/trpc";

const Model = () => {
  const router = useRouter();
  const { model } = router.query;

  const { data, isLoading, error } = trpc.useQuery(
    ["miner.get-miner", model as string],
    {
      retry: false,
    }
  );

  return (
    <>
      <Head>
        <title>{model}</title>
        <meta name="description" content="Single ASIC miner information" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="h-screen flex flex-col justify-center items-center text-white">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">{model}</h2>
          <ul>
            <li className="py-2 border-b flex flex-row justify-between gap-10">
              th/s: <span>{data?.th} th</span>
            </li>
            <li className="py-2 border-b flex flex-row justify-between gap-10">
              efficiency: <span>{data?.efficiency} w/th</span>
            </li>
            <li className="py-2 border-b flex flex-row justify-between gap-10">
              watts: <span>{data?.watts}</span>
            </li>
          </ul>
        </div>

        {isLoading && <div>Loading...</div>}
        {error && <div>Error: {error.message}</div>}
        {JSON.stringify(data)}
      </div>
    </>
  );
};

export default Model;

Model.getLayout = function getLayout(page: ReactElement) {
  return <AsicLayout>{page}</AsicLayout>;
};
