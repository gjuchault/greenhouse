import React, { useState } from "react";
import { Menu } from "evergreen-ui";
import { Hardware } from "../hardware";
import { Table } from "../../../components/Table";
import { Confirm } from "../../../components/Confirm";
import { UpdateHardware } from "./UpdateHardware";

interface Props {
  hardware: Hardware[];
  onUpdateHardware(hardware: Hardware): Promise<void>;
  onRestartHardware(hardware: Hardware): Promise<void>;
}

export function HardwareTable({
  hardware,
  onUpdateHardware,
  onRestartHardware,
}: Props) {
  const [hardwareToUpdate, setHardwareToUpdate] = useState<
    Hardware | undefined
  >(undefined);
  const [hardwareToRestart, setHardwareToRestart] = useState<
    Hardware | undefined
  >(undefined);
  const [isUpdatingHardware, setIsUpdatingHardware] = useState(false);
  const [isRestartingHardware, setIsRestartingHardware] = useState(false);

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
        items={hardware}
        renderFilterPlaceholder={(count) =>
          `Rechercher parmi ${count} matériels USB`
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
