import { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Download } from 'lucide-react';
import type { AmortizationRow, SimulationSummary, BondParams, LocalAddInsConfig, StreamOverrides } from '../types';
import { formatCurrency, formatRatio } from '../utils/formatters';
import { exportScheduleToCsv } from '../utils/exportSchedule';

interface AmortizationTableProps {
  schedule: AmortizationRow[];
  payoffYear: number | null;
  summary: SimulationSummary;
  bondParams: BondParams;
  localAddIns: LocalAddInsConfig;
  streamOverrides: StreamOverrides;
  paydownPct: number;
}

const columnHelper = createColumnHelper<AmortizationRow>();

export function AmortizationTable({
  schedule,
  payoffYear,
  summary,
  bondParams,
  localAddIns,
  streamOverrides,
  paydownPct,
}: AmortizationTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const handleExport = () => {
    exportScheduleToCsv({
      schedule,
      summary,
      bondParams,
      localAddIns,
      streamOverrides,
      paydownPct,
    });
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('year', {
        header: 'Year',
        cell: (info) => {
          const year = info.getValue();
          const row = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{year}</span>
              {row.inCapPeriod && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                  Cap
                </span>
              )}
              {row.bondsRetired && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  Paid Off
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('availableRevenue', {
        header: 'Revenue',
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor('interestDue', {
        header: 'Interest Due',
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor('interestPaid', {
        header: 'Interest Paid',
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor('interestCapitalized', {
        header: 'Interest Cap.',
        cell: (info) => {
          const val = info.getValue();
          return val > 0 ? (
            <span className="text-amber-600">{formatCurrency(val)}</span>
          ) : (
            <span className="text-gray-400">—</span>
          );
        },
      }),
      columnHelper.accessor('principalPaid', {
        header: 'Principal',
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor('extraPrincipal', {
        header: 'Extra Principal',
        cell: (info) => {
          const val = info.getValue();
          return val > 0 ? (
            <span className="text-green-600">{formatCurrency(val)}</span>
          ) : (
            <span className="text-gray-400">—</span>
          );
        },
      }),
      columnHelper.accessor('debtService', {
        header: 'Debt Service',
        cell: (info) => formatCurrency(info.getValue()),
      }),
      columnHelper.accessor('endingPrincipal', {
        header: 'Ending Balance',
        cell: (info) => {
          const val = info.getValue();
          return val > 0 ? formatCurrency(val) : <span className="text-green-600 font-medium">$0</span>;
        },
      }),
      columnHelper.accessor('coverageRatio', {
        header: 'Coverage',
        cell: (info) => {
          const val = info.getValue();
          const row = info.row.original;
          if (row.inCapPeriod || val === null || val === undefined) {
            return <span className="text-gray-400">—</span>;
          }
          const color = val >= 1.3 ? 'text-green-600' : val >= 1.0 ? 'text-yellow-600' : 'text-red-600';
          return <span className={color}>{formatRatio(val)}</span>;
        },
      }),
      columnHelper.accessor('excessRevenue', {
        header: 'Excess',
        cell: (info) => {
          const val = info.getValue();
          return val > 0 ? (
            <span className="text-blue-600">{formatCurrency(val)}</span>
          ) : (
            <span className="text-gray-400">—</span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: schedule,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: true, // Reset to page 1 when data changes
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  // Explicitly reset to first page when data changes. `table` is intentionally
  // omitted: useReactTable returns a new instance each render, so including it
  // would reset the page on every render instead of only when the data changes.
  useEffect(() => {
    table.setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  return (
    <div className="space-y-4">
      {/* Search / Filter / Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            title="Download schedule and assumptions as CSV"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Showing {table.getRowModel().rows.length} of {schedule.length} years
          {payoffYear && payoffYear < schedule.length && (
            <span className="ml-2 text-green-600">• Early payoff at Year {payoffYear}</span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronsUpDown className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => {
              const isCapPeriod = row.original.inCapPeriod;
              const isPaidOff = row.original.bondsRetired;
              const isPayoffYear = row.original.year === payoffYear;

              return (
                <tr
                  key={row.id}
                  className={`
                    ${isCapPeriod ? 'bg-amber-50' : ''}
                    ${isPaidOff ? 'bg-green-50' : ''}
                    ${isPayoffYear ? 'ring-2 ring-green-400 ring-inset' : ''}
                    hover:bg-gray-50
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {'<'}
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            {'>>'}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded"
          >
            {[10, 15, 20, 30].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-50 border border-amber-200 rounded"></div>
          <span>Capitalization Period</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
          <span>Bonds Retired</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-green-600">Green values</span>
          <span>= Extra principal / Paid off</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-600">Amber values</span>
          <span>= Capitalized interest</span>
        </div>
      </div>
    </div>
  );
}
