import React, { useState } from "react";
import { Menu } from "evergreen-ui";
import { Hardware } from "../hardware";
import { Table } from "../../../components/Table";
import { Confirm } from "../../../components/Confirm";
import { UpdateHardware } from "./UpdateHardware";

interface Props {
  hardwares: Hardware[];
  onUpdateHardware(hardware: Hardware): Promise<void>;
  onRestartHardware(hardware: Hardware): Promise<void>;
}

export function HardwareTable({
  hardwares,
  onUpdateHardware,
  onRestartHardware,
}: Props) {
  const [globalFilter, setGlobalFilter] = useState<string | undefined>();
  const [hardwareToUpdate, setHardwareToUpdate] = useState<
    Hardware | undefined
  >(undefined);
  const [hardwareToRestart, setHardwareToRestart] = useState<
    Hardware | undefined
  >(undefined);
  const [isUpdatingHardware, setIsUpdatingHardware] = useState(false);
  const [isRestartingHardware, setIsRestartingHardware] = useState(false);

  const filteredHardwares = hardwares.filter((hardware) => {
    if (globalFilter !== undefined) {
      return (
        hardware.name.includes(globalFilter) ||
        hardware.path.includes(globalFilter) ||
        hardware.type.includes(globalFilter)
      );
    }

    return true;
  });

  return (
    <>
      {hardwareToRestart && (
        <Confirm
          description={`Redémarrer le matériel ${hardwareToRestart.name} sur le port ${hardwareToRestart.path}?`}
          confirmationText="Redémarrer"
          isLoading={isRestartingHardware}
          onClose={() => {
            setHardwareToRestart(undefined);
          }}
          onConfirm={async () => {
            setIsRestartingHardware(true);
            await onRestartHardware(hardwareToRestart);
            setIsRestartingHardware(false);
            setHardwareToRestart(undefined);
          }}
        />
      )}
      {hardwareToUpdate && (
        <UpdateHardware
          isLoading={isUpdatingHardware}
          hardware={hardwareToUpdate}
          onClose={() => setHardwareToUpdate(undefined)}
          onConfirm={async (hardware) => {
            setIsUpdatingHardware(true);
            await onUpdateHardware(hardware);
            setIsUpdatingHardware(false);
            setHardwareToUpdate(undefined);
          }}
        />
      )}
      <Table<Hardware>
        items={filteredHardwares}
        setGlobalFilter={setGlobalFilter}
        renderFilterPlaceholder={() =>
          `Rechercher parmi ${hardwares.length} matériels USB`
        }
        columnsSizes={["auto", "auto", "auto"]}
        columns={[
          {
            Header: "Nom",
            accessor: "name",
          },
          {
            Header: "Chemin",
            accessor: "path",
          },
          {
            Header: "Type",
            accessor: "type",
          },
        ]}
        renderMenu={(hardware, close) => {
          return (
            <Menu>
              <Menu.Group>
                <Menu.Item
                  intent="none"
                  onClick={() => {
                    setHardwareToUpdate(hardware);
                    close();
                  }}
                >
                  Éditer
                </Menu.Item>
                <Menu.Item
                  intent="danger"
                  onClick={() => {
                    setHardwareToRestart(hardware);
                    close();
                  }}
                >
                  Redémarrer
                </Menu.Item>
              </Menu.Group>
            </Menu>
          );
        }}
      />
    </>
  );
}
