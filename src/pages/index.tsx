import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type AsicData =
  | {
      id: string;
      date: string;
      efficiency: string;
      model: string;
      price: number;
      th: number;
      vendor: string;
      watts: number;
      asicBTCPrice: number;
      value: number;
      wattDollar: number;
      currentHashPrice: number;
      elongatedHashPrice: number;
      denverDerivative: number;
      btcPerMonth: number;
      dollarPerMonth: number;
      monthlyEnergy: number;
      profitMonth: number;
      monthsToRoi: number;
    }
  | undefined;

const columnHelper = createColumnHelper<AsicData>();

const columns = [
  columnHelper.accessor("id", {
    cell: (info) => info.getValue(),
  }),
];

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["asics.get-asics-info"]);

  const table = useReactTable({
    data: !data ? [] : data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  console.log(data);

  return (
    <>
      <Head>
        <title>Asic-tools</title>
        <meta name="description" content="List of Bitcoin miners on sale" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold">
          <span className="text-gray-700">Asic-tools</span>
          {isLoading && <span className="text-gray-700">Loading...</span>}
        </h1>
        <div>
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Home;
