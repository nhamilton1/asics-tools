import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

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
  columnHelper.accessor("model", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("date", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("efficiency", {
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor("price", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("th", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("vendor", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("watts", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("asicBTCPrice", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("value", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("wattDollar", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("currentHashPrice", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("elongatedHashPrice", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("denverDerivative", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("btcPerMonth", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("dollarPerMonth", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("monthlyEnergy", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("profitMonth", {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("monthsToRoi", {
    cell: (info) => info.getValue(),
  }),
];

const Home: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["asics.get-asics-info"]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<AsicData>[]>(
    () => [
      {
        header: "Vendor",
        accessorKey: "vendor",
        cell: (info) => info.getValue(),
      },
      {
        header: "Model",
        accessorKey: "model",
        cell: (info) => info.getValue(),
      },
      {
        header: "TH",
        accessorKey: "th",
        cell: (info) => info.getValue(),
      },
      {
        header: "Price",
        accessorKey: "price",
        cell: (info) => info.getValue(),
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: (info) => info.getValue(),
      },
      {
        header: "Watts",
        accessorKey: "watts",
        cell: (info) => info.getValue(),
      },
      {
        header: "W/TH",
        accessorKey: "efficiency",
        cell: (info) => info.getValue(),
      },
      {
        header: "ASIC BTC Price",
        accessorKey: "asicBTCPrice",
        cell: (info) => info.getValue(),
      },
      {
        header: "Value ($/TH)",
        accessorKey: "value",
        cell: (info) => info.getValue(),
      },
      {
        header: "Watt $",
        accessorKey: "wattDollar",
        cell: (info) => info.getValue(),
      },
      {
        header: "Denver Derivative",
        accessorKey: "denverDerivative",
        cell: (info) => info.getValue(),
      },
      {
        header: "BTC Per Month",
        accessorKey: "btcPerMonth",
        cell: (info) => info.getValue(),
      },
      {
        header: "Monthly Energy",
        accessorKey: "monthlyEnergy",
        cell: (info) => info.getValue(),
      },
      {
        header: "Profit/Month",
        accessorKey: "profitMonth",
        cell: (info) => info.getValue(),
      },
      {
        header: "Months to ROI",
        accessorKey: "monthsToRoi",
        cell: (info) => info.getValue(),
      },
      {
        header: "$/Month",
        accessorKey: "dollarPerMonth",
        cell: (info) => info.getValue(),
      },
    ],
    []
  );

  const table = useReactTable({
    data: !data ? [] : data,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
  });

  console.log(data);

  return (
    <>
      <Head>
        <title>Asic-tools</title>
        <meta name="description" content="List of Bitcoin miners on sale" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center p-4 bg-slate-800 text-white h-screen">
        <h1 className="text-4xl font-bold">
          <span className="text-white">Asic-tools</span>
          {isLoading && <span className="text-white">Loading...</span>}
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
        <div className="flex items-center gap-2">
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="border rounded p-1"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1">
            | Go to page:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="border p-1 rounded w-12 text-black"
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="text-black"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </main>
    </>
  );
};

export default Home;
