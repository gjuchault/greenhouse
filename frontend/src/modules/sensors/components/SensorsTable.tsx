import React, { useState } from "react";
import { Menu } from "evergreen-ui";
import { Sensor, SensorInput } from "../sensor";
import { Table, makeDateCell } from "../../../components/Table";
import { Confirm } from "../../../components/Confirm";
import { UpdateSensor } from "./UpdateSensor";

interface Props {
  sensors: Sensor[];
  onCreateSensor(sensorInput: SensorInput): Promise<void>;
  onRemoveSensor(sensorId: string): Promise<void>;
  onUpdateSensor(sensor: Sensor): Promise<void>;
}

export function SensorsTable({
  sensors,
  onCreateSensor,
  onRemoveSensor,
  onUpdateSensor,
}: Props) {
  const [sensorToDelete, setsensorToDelete] = useState<Sensor | undefined>(
    undefined
  );
  const [sensorToUpdate, setSensorToUpdate] = useState<Sensor | undefined>(
    undefined
  );
  const [isUpdatingSensor, setIsUpdatingSensor] = useState(false);
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
        <UpdateSensor
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
      {sensorToUpdate && (
        <UpdateSensor
          isLoading={isUpdatingSensor}
          initialValues={sensorToUpdate}
          onClose={() => setSensorToUpdate(undefined)}
          onConfirm={async (sensor) => {
            setIsUpdatingSensor(true);
            await onUpdateSensor({
              id: sensorToUpdate.id,
              ...sensor,
            });
            setIsUpdatingSensor(false);
            setSensorToUpdate(undefined);
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
                intent="none"
                onClick={() => {
                  setSensorToUpdate(sensor);
                  close();
                }}
              >
                Éditer
              </Menu.Item>
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
