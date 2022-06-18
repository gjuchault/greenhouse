import React, { Suspense } from "react";
import { useAtom } from "jotai";
import { Pane, Card, Heading, majorScale } from "evergreen-ui";
import { LogsTable } from "../LogsTable";
import { logsAtom } from "../../queries";
import { SuspenseSpinner } from "../../../../components/SuspenseSpinner";

export function Logs() {
  return (
    <Suspense fallback={<SuspenseSpinner />}>
      <SuspensedLogs />
    </Suspense>
  );
}

function SuspensedLogs() {
  const [logs, update] = useAtom(logsAtom);

  return (
    <Card
      background="white"
      padding={majorScale(3)}
      elevation={1}
      margin={majorScale(3)}
    >
      <Heading size={900} marginBottom={majorScale(3)}>
        Logs
      </Heading>
      <Pane>
        <LogsTable
          logs={logs}
          onRefetch={async () => {
            await update({ type: "refetch" });
          }}
        />
      </Pane>
    </Card>
  );
}
