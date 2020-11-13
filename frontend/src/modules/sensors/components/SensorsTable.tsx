import React, { useState } from "react";
import { Menu } from "evergreen-ui";
import { Sensor, SensorInput } from "../sensor";
import { Table, makeDateCell } from "../../../components/Table";
import { Confirm } from "../../../components/Confirm";
import { CreateSensor } from "./CreateSensor";

interface Props {
  sensors: Sensor[];
  onCreateSensor(sensorInput: SensorInput): Promise<void>;
  onRemoveSensor(sensorId: string): Promise<void>;
}

export function SensorsTable({
  sensors,
  onCreateSensor,
  onRemoveSensor,
}: Props) {
  const [sensorToDelete, setsensorToDelete] = useState<Sensor | undefined>(
    undefined
  );
  const [showCreateSensor, setShowCreateSensor] = useState(false);
  const [isCreatingSensor, setIsCreatingSensor] = useState(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  return (
    <>
      {sensorToDelete && (
        <Confirm
          description={`Supprimer le senseur ${sensorToDelete.name}?`}
          isLoading={isRemoving}
          onClose={() => {
            setsensorToDelete(undefined);
          }}
          onConfirm={async () => {
            setIsRemoving(true);
            await onRemoveSensor(sensorToDelete.id);
            setIsRemoving(false);
            setsensorToDelete(undefined);
          }}
        />
      )}
      {showCreateSensor && (
        <CreateSensor
          isLoading={isCreatingSensor}
          onClose={() => setShowCreateSensor(false)}
          onConfirm={async (sensor) => {
            setIsCreatingSensor(true);
            await onCreateSensor(sensor);
            setIsCreatingSensor(false);
            setShowCreateSensor(false);
          }}
        />
      )}
      <Table<Sensor>
        items={sensors}
        renderFilterPlaceholder={(count) =>
          `Rechercher parmis ${count} capteurs`
        }
        columnsSizes={["auto", 150, 150, 150, 180, 180, 150]}
        columns={[
          {
            Header: "Nom",
            accessor: "name",
          },
          {
            Header: "Adresse",
            accessor: "sensor",
          },
          {
            Header: "Minimum",
            accessor: (item) => item.range.min,
          },
          {
            Header: "Maximum",
            accessor: (item) => item.range.max,
          },
          {
            Header: "Dernière valeur",
            accessor: (item) => item.lastStatement?.value,
          },
          {
            Header: "Envoyée le",
            accessor: (item) => new Date(item.lastStatement?.sentAt ?? 0),
            ...makeDateCell(),
          },
          {
            Header: "Source",
            accessor: (item) => item.lastStatement?.source,
          },
        ]}
        onNewItem={() => {
          setShowCreateSensor(true);
        }}
        renderMenu={(sensor, close) => (
          <Menu>
            <Menu.Group>
              <Menu.Item
                intent="danger"
                onClick={() => {
                  setsensorToDelete(sensor);
                  close();
                }}
              >
                Supprimer
              </Menu.Item>
            </Menu.Group>
          </Menu>
        )}
      />
    </>
  );
}
