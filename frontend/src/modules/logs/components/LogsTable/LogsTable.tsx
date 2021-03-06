import React from "react";
import { Table, makeDateCell } from "../../../../components/Table";
import { Log } from "../../log";

interface Props {
  logs: Log[];
  onRefetch(): Promise<void>;
}

export function LogsTable({ logs, onRefetch }: Props) {
  return (
    <Table<Log>
      items={logs}
      renderFilterPlaceholder={(count) => `Rechercher parmi ${count} lignes`}
      columnsSizes={[180, 140, "auto"]}
      onRefetch={onRefetch}
      columns={[
        {
          id: "date",
          Header: "Date",
          accessor: "date",
          ...makeDateCell(true),
        },
        {
          Header: "Service",
          accessor: "service",
        },
        {
          Header: "Message",
          accessor: "message",
        },
      ]}
      initialState={{
        sortBy: [
          {
            id: "date",
            desc: true,
          },
        ],
      }}
    />
  );
}
