import React, { useState, useMemo } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  TableOptions,
  Column,
} from "react-table";
import {
  Pane,
  Table as EvergreenTable,
  Popover,
  Position,
  MoreIcon,
  IconButton,
  Button,
  SearchInput,
  majorScale,
} from "evergreen-ui";
import { formatDate } from "../../helpers/date";

type Props<T extends object> = Omit<TableOptions<T>, "data"> & {
  items: T[];
  columns: Column<T>[];
  renderMenu?: (row: T, close: () => void) => React.ReactNode;
  renderFilterPlaceholder: () => string;
  renderFilterBarExtras?: () => React.ReactNode;
  onNewItem?: () => void;
  onRefetch?: () => Promise<void>;
  setGlobalFilter: (filter: string) => void;
  columnsSizes: (number | "auto")[];
};

export function Table<T extends object>({
  items,
  columns,
  renderMenu,
  renderFilterPlaceholder,
  onRefetch,
  setGlobalFilter,
  onNewItem,
  columnsSizes,
  ...props
}: Props<T>) {
  const data = useMemo(() => items, [items]);
  const [isRefetchDisabled, setIsRefetchDisabled] = useState(false);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
  } = useTable(
    {
      data,
      columns,
      ...props,
    },
    useGlobalFilter,
    useSortBy
  );

  const handleRefetch = async () => {
    if (!onRefetch) {
      return;
    }

    setIsRefetchDisabled(true);
    await onRefetch();
    setIsRefetchDisabled(false);
  };

  return (
    <>
      <Pane
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={majorScale(3)}
      >
        <Pane display="flex" justifyContent="flex-start" alignItems="center">
          <GlobalFilter
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
            renderFilterPlaceholder={renderFilterPlaceholder}
          />
          {onNewItem && (
            <Button
              height={40}
              appearance="primary"
              marginLeft={majorScale(3)}
              onClick={onNewItem}
            >
              Nouveau
            </Button>
          )}
          {props.renderFilterBarExtras?.()}
        </Pane>
        {onRefetch && (
          <Button
            height={40}
            onClick={handleRefetch}
            disabled={isRefetchDisabled}
          >
            Rafraîchir
          </Button>
        )}
      </Pane>
      <EvergreenTable border {...getTableProps()}>
        <EvergreenTable.Head>
          {headerGroups.map((headerGroup) => {
            return headerGroup.headers.map((column, i) => {
              const width = getColumnWidth(columnsSizes, i);

              return (
                <EvergreenTable.TextHeaderCell
                  maxWidth={width}
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                >
                  <>
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " ↓"
                          : " ↑"
                        : ""}
                    </span>
                  </>
                </EvergreenTable.TextHeaderCell>
              );
            });
          })}
          <EvergreenTable.HeaderCell width={48} flex="none" />
        </EvergreenTable.Head>
        <EvergreenTable.Body {...getTableBodyProps()} maxHeight={500}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <EvergreenTable.Row {...row.getRowProps()}>
                {row.cells.map((cell, i) => {
                  const width = getColumnWidth(columnsSizes, i);

                  return (
                    <EvergreenTable.TextCell
                      maxWidth={width}
                      {...cell.getCellProps()}
                    >
                      <>{cell.render("Cell")}</>
                    </EvergreenTable.TextCell>
                  );
                })}
                {renderMenu && (
                  <EvergreenTable.Cell width={48} flex="none">
                    <Popover
                      content={({ close }) => renderMenu(row.original, close)}
                      position={Position.BOTTOM_RIGHT}
                    >
                      <IconButton
                        icon={MoreIcon}
                        height={24}
                        appearance="minimal"
                      />
                    </Popover>
                  </EvergreenTable.Cell>
                )}
              </EvergreenTable.Row>
            );
          })}
        </EvergreenTable.Body>
      </EvergreenTable>
    </>
  );
}

type GlobalFilterProps = {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  renderFilterPlaceholder: () => string;
};

function GlobalFilter({
  globalFilter,
  setGlobalFilter,
  renderFilterPlaceholder,
}: GlobalFilterProps) {
  const [value, setValue] = React.useState(globalFilter);
  const onChange = (value: string) => {
    setGlobalFilter(value);
  };

  return (
    <SearchInput
      value={value || ""}
      height={40}
      width={350}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder={renderFilterPlaceholder()}
    />
  );
}

function getColumnWidth(columnsSizes: (number | "auto")[], i: number) {
  const size = columnsSizes[i];

  return !size || size === "auto" ? undefined : size;
}

export function makeDateCell(showSeconds: boolean = false) {
  return {
    Cell: (input: { value: Date }) => {
      if (
        !input.value ||
        Number.isNaN(input.value.getTime()) ||
        input.value.getFullYear() === new Date(0).getFullYear()
      ) {
        return "-";
      }

      return formatDate(input.value, showSeconds);
    },
    sortType: "datetime",
  };
}
