import React, { useState, useMemo } from 'react'
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useAsyncDebounce,
  TableOptions,
  Column,
} from 'react-table'
import {
  Pane,
  Table as EvergreenTable,
  Button,
  SearchInput,
  majorScale,
} from 'evergreen-ui'
import { formatDate } from '../../helpers/date'

type Props<T extends object> = Omit<TableOptions<T>, 'data'> & {
  items: T[]
  columns: Column<T>[]
  renderFilterPlaceholder: (count: number) => string
  onRefetch?: () => Promise<void>
  columnsSizes: (number | 'auto')[]
}

export function Table<T extends object>({
  items,
  columns,
  renderFilterPlaceholder,
  onRefetch,
  columnsSizes,
  ...props
}: Props<T>) {
  const data = useMemo(() => items, [items])
  const [isRefetchDisabled, setIsRefetchDisabled] = useState(false)

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      data,
      columns,
      ...props,
    },
    useGlobalFilter,
    useSortBy
  )

  const handleRefetch = async () => {
    if (!onRefetch) {
      return
    }

    setIsRefetchDisabled(true)
    await onRefetch()
    setIsRefetchDisabled(false)
  }

  return (
    <>
      <Pane
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={majorScale(3)}
      >
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
          renderFilterPlaceholder={renderFilterPlaceholder}
        />
        {onRefetch && (
          <Button onClick={handleRefetch} disabled={isRefetchDisabled}>
            Rafraîchir
          </Button>
        )}
      </Pane>
      <EvergreenTable border {...getTableProps()}>
        <EvergreenTable.Head>
          {headerGroups.map((headerGroup) => {
            return headerGroup.headers.map((column, i) => {
              const width = getColumnWidth(columnsSizes, i)

              return (
                <EvergreenTable.TextHeaderCell
                  maxWidth={width}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </EvergreenTable.TextHeaderCell>
              )
            })
          })}
        </EvergreenTable.Head>
        <EvergreenTable.Body {...getTableBodyProps()} maxHeight={500}>
          {rows.map((row) => {
            prepareRow(row)
            return (
              <EvergreenTable.Row {...row.getRowProps()}>
                {row.cells.map((cell, i) => {
                  const width = getColumnWidth(columnsSizes, i)

                  return (
                    <EvergreenTable.TextCell
                      maxWidth={width}
                      {...cell.getCellProps()}
                    >
                      {cell.render('Cell')}
                    </EvergreenTable.TextCell>
                  )
                })}
              </EvergreenTable.Row>
            )
          })}
        </EvergreenTable.Body>
      </EvergreenTable>
    </>
  )
}

type GlobalFilterProps = {
  preGlobalFilteredRows: unknown[]
  globalFilter: string
  setGlobalFilter: (value?: string) => void
  renderFilterPlaceholder: (count: number) => string
}

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  renderFilterPlaceholder,
}: GlobalFilterProps) {
  const count = preGlobalFilteredRows.length
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined)
  }, 200)

  return (
    <SearchInput
      value={value || ''}
      height={40}
      width={350}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        onChange(e.target.value)
      }}
      placeholder={renderFilterPlaceholder(count)}
    />
  )
}

function getColumnWidth(columnsSizes: (number | 'auto')[], i: number) {
  const size = columnsSizes[i]

  return !size || size === 'auto' ? undefined : size
}

export function makeDateCell(showSeconds: boolean = false) {
  return {
    Cell: (input: { value: Date }) => {
      if (
        !input.value ||
        Number.isNaN(input.value.getTime()) ||
        input.value.getFullYear() === new Date(0).getFullYear()
      ) {
        return '-'
      }

      return formatDate(input.value, showSeconds)
    },
    sortType: 'datetime',
  }
}
