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

import {
  InputHTMLAttributes,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsicLayout from "../components/asicLayout.tsx/asicLayout";
import { NextPageWithLayout } from "./_app";
import Link from "next/link";
import { useRouter } from "next/router";
import MinedBlocksTicker from "../components/minedBlocksTicker";

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

const Home: NextPageWithLayout = () => {
  const localStorage =
    typeof window !== `undefined` ? window.localStorage : null;

  const router = useRouter();
  const [kWhPrice, setKWhPrice] = useState<number>(
    Number(localStorage?.getItem("kWhPrice")) || 0.12
  );

  const { data: asicData, isLoading } = trpc.useQuery(
    ["asics.get-asics-info"],
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      keepPreviousData: true,
      select: (data) => {
        const format = data.formattingAsicData.map((a) => {
          if (a?.id) {
            let asicBTCPrice =
              Math.round(1000000 * (a.price / data.currentBTCPrice)) / 1000000;
            let value = Math.round(a.price / a.th);
            let wattDollar = Number((value * Number(a.efficiency)).toFixed(0));
            let denverDerivative = Number(
              (wattDollar / data.elongatedHashPrice).toFixed(2)
            );
            let btcPerMonth =
              Math.round(
                1000000 * ((a.th / (data.currentHash * 1000000)) * 900 * 30.5)
              ) / 1000000;
            let dollarPerMonth = Math.round(btcPerMonth * data.currentBTCPrice);
            let monthlyEnergy =
              Math.round(100 * (732 * (a.watts * 0.001) * Number(kWhPrice))) /
              100;
            let profitMonth = Math.round(dollarPerMonth - monthlyEnergy);
            let monthsToRoi =
              Math.round(100 * (a.price / dollarPerMonth)) / 100;

            return {
              ...a,
              asicBTCPrice,
              value,
              wattDollar,
              denverDerivative,
              btcPerMonth,
              dollarPerMonth,
              monthlyEnergy,
              profitMonth,
              monthsToRoi,
            };
          }
        });
        return {
          formattingAsicData: format,
          formattedBTCPrice: data.currentBTCPrice.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          }),
          currentBTCPrice: data.currentBTCPrice,
          currentHash: data.currentHash,
          currentHashPrice: data.currentHashPrice,
          formattedHashPrice: data.currentHashPrice.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          }),
          elongatedHashPrice: data.elongatedHashPrice,
          formattedElongatedHashPrice: data.elongatedHashPrice.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "USD",
            }
          ),
          currentHashValue: data.currentHashValue,
        };
      },
      onSuccess: (data) => {
        setData(data.formattingAsicData);
      },
    }
  );

  const [data, setData] = useState<AsicData[] | undefined>(
    asicData?.formattingAsicData || undefined
  );

  useEffect(() => {
    const format = data?.map((a) => {
      if (a?.id && asicData) {
        let asicBTCPrice =
          Math.round(1000000 * (a.price / asicData.currentBTCPrice)) / 1000000;
        let value = Math.round(a.price / a.th);
        let wattDollar = Number((value * Number(a.efficiency)).toFixed(0));
        let denverDerivative = Number(
          (wattDollar / asicData.elongatedHashPrice).toFixed(2)
        );
        let btcPerMonth =
          Math.round(
            1000000 * ((a.th / (asicData.currentHash * 1000000)) * 900 * 30.5)
          ) / 1000000;
        let dollarPerMonth = Math.round(
          btcPerMonth * asicData.currentBTCPrice!
        );
        let monthlyEnergy =
          Math.round(100 * (732 * (a.watts * 0.001) * Number(kWhPrice))) / 100;
        let profitMonth = Math.round(dollarPerMonth - monthlyEnergy);
        let monthsToRoi = Math.round(100 * (a.price / dollarPerMonth)) / 100;

        return {
          ...a,
          asicBTCPrice,
          value,
          wattDollar,
          denverDerivative,
          btcPerMonth,
          dollarPerMonth,
          monthlyEnergy,
          profitMonth,
          monthsToRoi,
        };
      }
    });
    setData(format);

    return () => {
      setData([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kWhPrice]);

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
        header: "Profit per Month",
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
    data: !!data ? data : [],
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: true,
  });

  return (
    <>
      <Head>
        <title>ASIC Tools</title>
        <meta
          name="description"
          content="List of Bitcoin ASIC miners for sale"
        />
      </Head>
      <main className="flex flex-col items-start justify-start bg-slate-900 text-white font-Roboto">
        <div className="w-full flex lg:flex-row lg:items-center items-start justify-center flex-col-reverse lg:gap-0 gap-10">
          <div className="flex flex-row items-center justify-start gap-2 lg:ml-5 ml-2">
            <label>
              <span className="text-white">Enter your kWh Price: </span>
            </label>
            <input
              type={"number"}
              className={"w-1/4 p-1 rounded-md bg-slate-800 text-white border"}
              value={kWhPrice}
              step={0.01}
              onChange={(e) => {
                let kWh = Number(e.target.value);
                localStorage?.setItem("kWhPrice", kWh.toString());
                setKWhPrice(kWh);
              }}
            />
          </div>
          <MinedBlocksTicker />
        </div>

        {/* 
          had to add the !!data && because react table was causing some kind of infinite loop until the data was loaded.
        */}
        {!!data && (
          <>
            {isLoading ? (
              <div className="block max-w-full overflow-y-hidden">
                <table className="w-full">
                  <thead className="border-b">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="text-left">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="text-sm font-medium px-4 py-2"
                            colSpan={header.colSpan}
                            style={{
                              position: "relative",
                              width: header.getSize(),
                            }}
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
                            {header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={`resizer ${
                                  header.column.getIsResizing()
                                    ? "isResizing"
                                    : ""
                                }`}
                              />
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {Array(10)
                      .fill(0)
                      .map((_, i) => (
                        <tr
                          key={i}
                          className={`border-b transition duration-300 ease-in-out hover:bg-slate-700 ${
                            i % 2 ? "bg-slate-900" : "bg-slate-800"
                          }`}
                        >
                          {Array(16)
                            .fill(0)
                            .map((_, j) => (
                              <td
                                className={`px-4 py-4 whitespace-nowrap`}
                                key={j}
                              >
                                <div className="flex items-center mt-4 space-x-3">
                                  <div className="h-2.5 bg-gray-400 rounded-full dark:bg-gray-700 w-10"></div>
                                </div>
                              </td>
                            ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="block max-w-full overflow-y-hidden">
                <table className="w-full">
                  <thead className="border-b">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="text-left">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="text-sm font-medium px-4 py-2"
                            colSpan={header.colSpan}
                            style={{
                              position: "relative",
                              width: header.getSize(),
                            }}
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
                            {header.column.getCanResize() && (
                              <div
                                onMouseDown={header.getResizeHandler()}
                                onTouchStart={header.getResizeHandler()}
                                className={`resizer ${
                                  header.column.getIsResizing()
                                    ? "isResizing"
                                    : ""
                                }`}
                              />
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`border-b transition duration-300 ease-in-out hover:bg-slate-700 ${
                          index % 2 ? "bg-slate-900" : "bg-slate-800"
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={`px-4 py-4 whitespace-nowrap ${
                              cell.column.columnDef.header === "Model"
                                ? "cursor-pointer hover:text-orange-400"
                                : ""
                            }`}
                            style={{ width: cell.column.getSize() }}
                            onClick={() => {
                              if (cell.column.columnDef.header === "Model") {
                                const model = cell.row.original?.model.includes(
                                  "J/th"
                                )
                                  ? cell.row.original?.model.replace(
                                      "J/th",
                                      "J th"
                                    )
                                  : cell.row.original?.model;

                                router.push(`/[model]`, `/${model}`);
                              } else return;
                            }}
                          >
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

                <div className="bg-slate-900 w-full">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full my-4">
                    <div className="flex flex-row gap-2">
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
                        onClick={() =>
                          table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                      >
                        {">>"}
                      </button>
                    </div>
                    <div className="flex flex-row gap-2">
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
                          defaultValue={
                            table.getState().pagination.pageIndex + 1
                          }
                          onChange={(e) => {
                            let page = e.target.value
                              ? Number(e.target.value) - 1
                              : 0;
                            table.setPageIndex(page);
                          }}
                          className="border p-1 rounded w-12 text-black"
                        />
                      </span>
                    </div>
                    <div className="flex flex-row gap-2">
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
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-slate-900 w-full p-4">
          {DenverAndDefs(
            asicData?.formattedBTCPrice,
            asicData?.currentHash,
            asicData?.formattedHashPrice,
            asicData?.currentHashValue,
            asicData?.formattedElongatedHashPrice
          )}
          <div className="flex flex-col justify-start items-start ml-5">
            <p className="font-extrabold text-white">
              Credit to Joe Rodgers for the idea.
            </p>
            <p className="text-white">
              Joe&apos;s twitter:{" "}
              <Link href={"https://twitter.com/_joerodgers"}>
                <a target="_blank" className="text-blue-500">
                  @_joerodgers
                </a>
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

Home.getLayout = function getLayout(page: ReactElement) {
  return <AsicLayout>{page}</AsicLayout>;
};

function DenverAndDefs(
  price?: string,
  hashrate?: number,
  hashPrice?: string,
  hashValue?: number,
  enlongatedHashPrice?: string
) {
  return (
    <div className="flex md:flex-row flex-col justify-center gap-10 w-full">
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-center">
          <div className="w-1/4 h-[1px] bg-white" />
          <h2 className="text-lg font-bold text-center whitespace-nowrap px-1">
            Hidden Values
          </h2>
          <div className="w-full h-[1px] bg-white" />
        </div>
        <ul className="border">
          <li className="py-2 border-b px-4">
            Values that are used in the table, but are not displayed
          </li>
          <li className="py-2 border-b flex flex-row justify-between items-center gap-10 px-4">
            Current BTC price:{" "}
            {!price ? (
              <div className="h-4 bg-gray-400 rounded-full dark:bg-gray-700 w-16" />
            ) : (
              <span>{price}</span>
            )}
          </li>
          <li className="py-2 border-b flex flex-row justify-between items-center gap-10 px-4">
            Current Network Hashrate:{" "}
            {!hashrate ? (
              <div className="h-4 bg-gray-400 rounded-full dark:bg-gray-700 w-16" />
            ) : (
              <span>{hashrate}</span>
            )}
          </li>
          <li className="py-2 border-b flex flex-row justify-between items-center gap-10 px-4">
            Current Hash Price:{" "}
            {!hashPrice ? (
              <div className="h-4 bg-gray-400 rounded-full dark:bg-gray-700 w-16" />
            ) : (
              <span>{hashPrice}</span>
            )}
          </li>
          <li className="py-2 border-b flex flex-row justify-between items-center gap-10 px-4">
            Elongated Hash Price:{" "}
            {!enlongatedHashPrice ? (
              <div className="h-4 bg-gray-400 rounded-full dark:bg-gray-700 w-16" />
            ) : (
              <span>{enlongatedHashPrice}</span>
            )}
          </li>
          <li className="py-2 border-b flex flex-row justify-between items-center gap-10 px-4">
            Current Hash Value:{" "}
            {!hashValue ? (
              <div className="h-4 bg-gray-400 rounded-full dark:bg-gray-700 w-16" />
            ) : (
              <span>{hashValue}</span>
            )}
          </li>
        </ul>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-center">
          <div className="w-1/4 h-[1px] bg-white" />
          <h2 className="text-lg font-bold text-center whitespace-nowrap px-1">
            Definitions
          </h2>
          <div className="w-full h-[1px] bg-white" />
        </div>
        <ul className="border">
          {[
            "Watts/Th = An ASIC's total watt consumption divided by its nominal Th/s rating.",
            "$/Th = The total cost of an ASIC divided by its nominal Th/s rating.",
            "WattDollar = The product of an ASIC's watts/Th multiplied by $/Th.",
            "Hash price = USD value of 1 Th/s over the course of 24 hours.",
            "Elongated hash price = USD value of 1 Th/s over the course of 50,000 blocks.",
          ].map((denv) => (
            <li key={denv} className="py-2 border-b px-4">
              {denv}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-center">
          <div className="w-1/4 h-[1px] bg-white" />
          <h2 className="text-lg font-bold text-center whitespace-nowrap px-1">
            Denver&apos;s Derivative
          </h2>
          <div className="w-full h-[1px] bg-white" />
        </div>
        <ul className="border">
          {[
            "Denver's Derivative (DD) = WattDollar/Elongated hash price =",
            ">50 = If your power is less than ~$0.035 OR you're going to run the ASIC for five-plus years.",
            "<50 = If your power is less than ~$0.055 OR you're going to run the ASIC for four-plus years.",
            "<40 = If your power is less than ~$0.075 OR you're going to run the ASIC for three-plus years.",
            "<30 = If your power is less than ~$0.125 OR you're going to run the ASIC for three years.",
            "<20 = If your power is less than ~$0.15 OR you're going to run the ASIC for two-plus years.",
            "<15 = Borrow to buy all the hardware (just kidding but not really).",
          ].map((denv) => (
            <li key={denv} className="py-2 border-b px-4">
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
        className="w-36 border shadow rounded bg-slate-800 p-1"
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
    <div className="flex flex-row gap-2">
      <input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {!!value && (
        <button
          onClick={() => setValue("")}
          className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded"
        >
          X
        </button>
      )}
    </div>
  );
}
