import { useTheme } from '@/contexts/ThemeProvider'
import SvgMarket from '@/libs/icons/src/lib/icons/Market'
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

interface TableProps {
  columnsData: ColumnDef<Record<string, any>, any>[]
  data: Array<Record<string, any>>
  thStyle?: string
  tdStyle?: string
  trStyle?: string
  theadStyle?: string
  tbodyStyle?: string
  tableStyle?: string
  customTdStyle?: Record<string, string>
  customRow?: React.ReactNode
  hoveredRows?: Record<string, React.ReactNode>
}

const Table = ({
  columnsData,
  data,
  thStyle,
  tdStyle,
  trStyle,
  theadStyle,
  tbodyStyle,
  tableStyle,
  customTdStyle,
  customRow,
  hoveredRows,
}: TableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [hoveredRowId, setHoveredRowId] = useState<string>('-1')
  const { theme } = useTheme()

  const columns = useMemo(() => [...columnsData], [])
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
    enableSorting: true,
    enableSortingRemoval: false,
    enableMultiSort: true,
    sortDescFirst: true,
  })

  return (
    <table className={`w-full h-full table-auto text-xs ${tableStyle ?? ''}`}>
      <thead className={`text-left ${theadStyle ?? ''}`}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <th
                  className={`${thStyle ?? ''}`}
                  key={header.id}
                  colSpan={header.colSpan}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? 'cursor-pointer select-none flex items-center'
                          : '',
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {
                        {
                          asc: (
                            <SvgMarket
                              fill={theme === 'dark' ? 'white' : undefined}
                            />
                          ),
                          desc: (
                            <SvgMarket
                              fill={theme === 'dark' ? 'white' : undefined}
                              className="rotate-180"
                            />
                          ),
                        }[header.column.getIsSorted() as string]
                      }
                      {header.column.columnDef.header &&
                        header.column.getCanSort() &&
                        !header.column.getIsSorted() && (
                          <SvgMarket
                            fill={theme === 'dark' ? 'white' : undefined}
                          />
                        )}
                    </div>
                  )}
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody className={`${tbodyStyle ?? ''}`}>
        {/* {customRow} */}
        {table.getRowModel().rows.map((row) => {
          return (
            <>
              <tr
                className={trStyle ?? ''}
                key={row.id}
                onMouseEnter={() => {
                  if (hoveredRows) {
                    setHoveredRowId(row.id)
                  }
                }}
                onMouseLeave={() => {
                  if (hoveredRows) {
                    setHoveredRowId('-1')
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td
                      key={cell.id}
                      className={`${tdStyle ?? ''} ${
                        customTdStyle &&
                        Object.keys(customTdStyle).includes(row.id)
                          ? customTdStyle[row.id]
                          : ''
                      }`}
                    >
                      <>
                        {typeof cell.getContext().cell.getValue() !== 'object'
                          ? flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          : cell.getContext().cell.getValue()}
                      </>
                    </td>
                  )
                })}
              </tr>
              <>
                {hoveredRows &&
                  hoveredRowId === row.id &&
                  hoveredRows[hoveredRowId]}
              </>
            </>
          )
        })}
      </tbody>
    </table>
  )
}
export default Table
