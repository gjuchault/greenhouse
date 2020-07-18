import React, { useMemo } from 'react'
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useAsyncDebounce,
  Column,
} from 'react-table'
import { Pane, Table, SearchInput, majorScale } from 'evergreen-ui'
import { EmitterSensor } from '../../hooks/useQuery'
import { formatDate } from '../../helpers/date'

type Props = {
  emitterSensors: EmitterSensor[]
}

export function SensorsTable({ emitterSensors }: Props) {
  const columns = React.useMemo<Column<EmitterSensor>[]>(
    () => [
      {
        Header: 'Nom',
        accessor: 'name',
      },
      {
        Header: 'Adresse',
        accessor: 'sensor',
      },
      {
        Header: 'Minimum',
        accessor: (item) => item.range.min,
      },
      {
        Header: 'Maximum',
        accessor: (item) => item.range.max,
      },
      {
        Header: 'Dernière valeur',
        accessor: (item) => item.lastStatement?.value,
      },
      {
        Header: 'Envoyée le',
        accessor: (item) => new Date(item.lastStatement?.sentAt ?? 0),
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
      {
        Header: 'Source',
        accessor: (item) => item.lastStatement?.source,
      },
    ],
    []
  )

  const data = useMemo(() => emitterSensors, [emitterSensors])

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
      <Table {...getTableProps()}>
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
      placeholder={`Rechercher parmis ${count} capteurs...`}
    />
  )
}
