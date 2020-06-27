import React, { useMemo } from 'react'
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useAsyncDebounce,
  Column,
} from 'react-table'
import styles from './SensorsTable.module.css'

type Props = {
  emitterSensors: EmitterSensor[]
}

type EmitterSensor = {
  id: string
  sensor: string
  name: string
  min: number
  max: number
  lastValue?: string
  lastValueSentAt?: string
  lastValueSentFrom?: string
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
        accessor: 'min',
      },
      {
        Header: 'Maximum',
        accessor: 'max',
      },
      {
        Header: 'Dernière valeur',
        accessor: 'lastValue',
      },
      {
        Header: 'Envoyée le',
        accessor: 'lastValueSentAt',
      },
      {
        Header: 'Source',
        accessor: 'lastValueSentFrom',
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
