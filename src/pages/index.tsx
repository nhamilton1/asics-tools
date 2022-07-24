import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const { data: asics, isLoading } = trpc.useQuery(["asics.get-asics-info"]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(asics);

  return (
    <>
      <Head>
        <title>Asic-tools</title>
        <meta name="description" content="List of Bitcoin miners on sale" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-4xl font-bold">
          <span className="text-gray-700">Asic-tools</span>
        </h1>
      </main>
    </>
  );
};

export default Home;
