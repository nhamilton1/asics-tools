import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedUniqueValues,
  Table,
  useReactTable,
} from "@tanstack/react-table";

import { InputHTMLAttributes, useEffect, useMemo, useState } from "react";

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

const Home: NextPage = () => {
  const [data, setData] = useState<AsicData[]>([]);
  const [defs, setDefs] = useState<{
    currentBTCPrice: string;
    currentHash: number;
    currentHashPrice: string;
    elongatedHashPrice: string;
    currentHashValue: number;
  }>();

  const { isLoading } = trpc.useQuery(["asics.get-asics-info"], {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    onSuccess: (data) => {
      setData(data.formattingAsicData);
      setDefs({
        currentBTCPrice: data.currentBTCPrice,
        currentHash: data.currentHash,
        currentHashPrice: data.currentHashPrice,
        elongatedHashPrice: data.elongatedHashPrice,
        currentHashValue: data.currentHashValue,
      });
    },
  });

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
        header: "W/TH",
        accessorKey: "efficiency",
        cell: (info) => info.getValue(),
      },
      {
        header: "Price",
        accessorKey: "price",
        cell: (info) => info.getValue(),
      },
      {
        header: "TH",
        accessorKey: "th",
        cell: (info) => info.getValue(),
      },
      {
        header: "Watts",
        accessorKey: "watts",
        cell: (info) => info.getValue(),
      },
      {
        header: "Date",
        accessorKey: "date",
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
    getFacetedUniqueValues: getFacetedUniqueValues(),
    debugTable: true,
  });

  return (
    <>
      <Head>
        <title>Asic-tools</title>
        <meta name="description" content="List of Bitcoin miners on sale" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center m-4 bg-slate-800 text-white gap-10">
        <h1 className="text-4xl font-bold">
          <span className="text-white">Asic-tools</span>
          {isLoading && <span className="text-white">Loading...</span>}
        </h1>
        <table>
          <thead className="border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-left">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-sm font-medium px-4 py-2 whitespace-nowrap"
                    colSpan={header.colSpan}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getCanFilter() &&
                    header.column.columnDef.header === "Model" ? (
                      <Filter column={header.column} table={table} />
                    ) : null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b transition duration-300 ease-in-out hover:bg-slate-700"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="font-light px-4 py-6 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-2">
          <button
            className={
              !table.getCanPreviousPage()
                ? "text-gray-500 border-gray-500 border p-1 rounded"
                : "border rounded p-1 cursor-pointer"
            }
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className={
              !table.getCanPreviousPage()
                ? "text-gray-500 border-gray-500 border p-1 rounded"
                : "border rounded p-1 cursor-pointer"
            }
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className={
              !table.getCanNextPage()
                ? "text-gray-500 border-gray-500 border p-1 rounded"
                : "border rounded p-1 cursor-pointer"
            }
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className={
              !table.getCanNextPage()
                ? "text-gray-500 border-gray-500 border p-1 rounded"
                : "border rounded p-1 cursor-pointer"
            }
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
                let page = e.target.value ? Number(e.target.value) - 1 : 0;
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
        {DenverAndDefs(
          defs?.currentBTCPrice,
          defs?.currentHash,
          defs?.currentHashPrice,
          defs?.currentHashValue,
          defs?.elongatedHashPrice
        )}
      </main>
    </>
  );
};

export default Home;

function DenverAndDefs(
  price?: string,
  hashrate?: number,
  hashPrice?: string,
  hashValue?: number,
  enlongatedHashPrice?: string
) {
  return (
    <div className="flex flex-row justify-center gap-10">
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">Hidden Values</h2>
        <ul>
          <li className="py-2 border-b">
            Values that are used in the table, but are not displayed
          </li>
          <li className="py-2 border-b flex flex-row justify-between gap-10">
            Current BTC price: <span>{price}</span>
          </li>
          <li className="py-2 border-b flex flex-row justify-between gap-10">
            Current Network Hashrate: <span>{hashrate} EH/s</span>
          </li>
          <li className="py-2 border-b flex flex-row justify-between gap-10">
            Current Hash Price: <span>{hashPrice}</span>
          </li>
          <li className="py-2 border-b flex flex-row justify-between gap-10">
            Elongated Hash Price: <span>{enlongatedHashPrice}</span>
          </li>
          <li className="py-2 border-b flex flex-row justify-between gap-10">
            Current Hash Value: <span>{hashValue} sats</span>
          </li>
        </ul>
      </div>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">Definitions</h2>
        <ul>
          {[
            "Watts/Th = An ASIC's total watt consumption divided by its nominal Th/s rating.",
            "$/Th = The total cost of an ASIC divided by its nominal Th/s rating.",
            "WattDollar = The product of an ASIC's watts/Th multiplied by $/Th.",
            "Hash price = USD value of 1 Th/s over the course of 24 hours.",
            "Elongated hash price = USD value of 1 Th/s over the course of 50,000 blocks.",
          ].map((denv) => (
            <li key={denv} className="py-2 border-b">
              {denv}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">Denver&apos;s Derivative</h2>
        <ul>
          {[
            "Denver's Derivative (DD) = WattDollar/Elongated hash price =",
            ">50 = If your power is less than ~$0.035 OR you're going to run the ASIC for five-plus years.",
            "<50 = If your power is less than ~$0.055 OR you're going to run the ASIC for four-plus years.",
            "<40 = If your power is less than ~$0.075 OR you're going to run the ASIC for three-plus years.",
            "<30 = If your power is less than ~$0.125 OR you're going to run the ASIC for three years.",
            "<20 = If your power is less than ~$0.15 OR you're going to run the ASIC for two-plus years.",
            "<15 = Borrow to buy all the hardware (just kidding but not really).",
          ].map((denv) => (
            <li key={denv} className="py-2 border-b">
              {denv}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Filter({
  column,
  table,
}: {
  column: Column<any, unknown>;
  table: Table<any>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = useMemo(
    () =>
      typeof firstValue === "number"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [column.getFacetedUniqueValues()]
  );

  return (
    <>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        className="w-36 border shadow rounded bg-slate-800 p-1 ml-2"
        list={column.id + "list"}
      />
    </>
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
