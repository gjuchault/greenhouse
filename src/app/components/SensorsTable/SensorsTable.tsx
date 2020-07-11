import React, { useMemo } from 'react'
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useAsyncDebounce,
  Column,
} from 'react-table'
import { EmitterSensor } from '../../hooks/useQuery'
import { formatDate } from '../../helpers/date'
import styles from './SensorsTable.module.css'

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
    <table {...getTableProps()} className={styles.table}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span>
                  {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                </span>
              </th>
            ))}
          </tr>
        ))}
        <tr>
          <th
            colSpan={visibleColumns.length}
            style={{
              textAlign: 'left',
            }}
          >
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
          </th>
        </tr>
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
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
    <span>
      Search:{' '}
      <input
        value={value || ''}
        onChange={(e) => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder={`${count} records...`}
        style={{
          fontSize: '1.1rem',
          border: '0',
        }}
      />
    </span>
  )
}
