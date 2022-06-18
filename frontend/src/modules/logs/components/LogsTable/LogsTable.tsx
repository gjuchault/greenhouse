import { Button, majorScale, minorScale, Pane } from "evergreen-ui";
import React, { useState } from "react";
import { Table, makeDateCell } from "../../../../components/Table";
import { Log } from "../../log";

interface Props {
  logs: Log[];
  onRefetch(): Promise<void>;
}

export function LogsTable({ logs, onRefetch }: Props) {
  const [filteredService, setFilteredService] = useState<string | undefined>();
  const [globalFilter, setGlobalFilter] = useState<string | undefined>();

  const filteredLogs = logs.filter((log) => {
    if (filteredService !== undefined) {
      return log.service === filteredService;
    }

    if (globalFilter !== undefined) {
      return (
        log.service.includes(globalFilter) || log.message.includes(globalFilter)
      );
    }

    return true;
  });

  function toggleService(service: string) {
    if (filteredService === service) {
      setFilteredService(undefined);
      return;
    }

    setFilteredService(service);
  }

  return (
    <Table<Log>
      items={filteredLogs}
      setGlobalFilter={setGlobalFilter}
      renderFilterPlaceholder={() => `Rechercher parmi ${logs.length} lignes`}
      columnsSizes={[180, 140, "auto"]}
      onRefetch={onRefetch}
      renderFilterBarExtras={() => (
        <Pane marginLeft={majorScale(2)}>
          <Button
            appearance={filteredService === "rule" ? "primary" : "default"}
            marginRight={minorScale(2)}
            onClick={() => toggleService("rule")}
          >
            Règles
          </Button>
          <Button
            appearance={filteredService === "command" ? "primary" : "default"}
            marginRight={minorScale(2)}
            onClick={() => toggleService("command")}
          >
            Commandes
          </Button>
          <Button
            appearance={filteredService === "arduino" ? "primary" : "default"}
            marginRight={minorScale(2)}
            onClick={() => toggleService("arduino")}
          >
            Capteurs
          </Button>
          <Button
            appearance={filteredService === "radio" ? "primary" : "default"}
            marginRight={minorScale(2)}
            onClick={() => toggleService("radio")}
          >
            Radio
          </Button>
          <Button
            appearance={filteredService === "net" ? "primary" : "default"}
            marginRight={minorScale(2)}
            onClick={() => toggleService("net")}
          >
            Net
          </Button>
        </Pane>
      )}
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
