import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSizeOptions?: number[];
  initialPageSize?: number;
}

function DataTable<T>({
  data = [],
  columns,
  pageSizeOptions = [5, 10, 20],
  initialPageSize = 10,
}: TableProps<T>) {
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [pageIndex, setPageIndex] = React.useState(0);

  const table = useReactTable({
    data: data ?? [],
    columns,
    pageCount: -1,
    state: { pageIndex, pageSize },
    onPageChange: setPageIndex,
    onPageSizeChange: setPageSize,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="border border-gray-300 px-4 py-2 text-left bg-gray-100"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-4">
                No data found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="mr-2 px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div>
          <span className="mr-2">
            Page{' '}
            <strong>
              {table.getState().pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>

          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
