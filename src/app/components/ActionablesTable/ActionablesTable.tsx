import React, { useMemo } from 'react'
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useAsyncDebounce,
  Column,
} from 'react-table'
import { Pane, Table, SearchInput, majorScale } from 'evergreen-ui'
import { Actionable } from '../../hooks/useQuery'
import { formatDate } from '../../helpers/date'

type Props = {
  actionables: Actionable[]
}

export function ActionablesTable({ actionables }: Props) {
  const columns = React.useMemo<Column<Actionable>[]>(
    () => [
      {
        Header: 'Nom',
        accessor: 'name',
      },
      {
        Header: 'Adresse',
        accessor: 'target',
      },
      {
        Header: 'Type de valeur',
        accessor: (item) => item.valueType.range,
      },
      {
        Header: 'Valeur actuelle',
        accessor: (item) => item.lastAction?.value,
      },
      {
        Header: 'Envoyée le',
        accessor: (item) => new Date(item.lastAction?.sentAt ?? 0),
        Cell: (input: { value: Date }) => {
          if (
            !input.value ||
            Number.isNaN(input.value.getTime()) ||
            input.value.getFullYear() === new Date(0).getFullYear()
          ) {
            return '-'
          }

          return formatDate(input.value)
        },
        sortType: 'datetime',
      },
    ],
    []
  )

  const data = useMemo(() => actionables, [actionables])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      data,
      columns,
    },
    useGlobalFilter,
    useSortBy
  )

  return (
    <>
      <Pane marginBottom={majorScale(3)}>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
      </Pane>
      <Table border {...getTableProps()}>
        <Table.Head>
          {headerGroups.map((headerGroup) => {
            return headerGroup.headers.map((column) => (
              <Table.TextHeaderCell
                {...column.getHeaderProps(column.getSortByToggleProps())}
              >
                {column.render('Header')}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                </span>
              </Table.TextHeaderCell>
            ))
          })}
        </Table.Head>
        <Table.Body {...getTableBodyProps()} height={500}>
          {rows.map((row, i) => {
            prepareRow(row)
            return (
              <Table.Row {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <Table.TextCell {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </Table.TextCell>
                  )
                })}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </>
  )
}

type GlobalFilterProps = {
  preGlobalFilteredRows: unknown[]
  globalFilter: string
  setGlobalFilter: (value?: string) => void
}

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
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
      placeholder={`Rechercher parmis ${count} actionables...`}
    />
  )
}
