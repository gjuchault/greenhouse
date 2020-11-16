import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, TextInputField } from "evergreen-ui";
import { SensorInput } from "../sensor";
import { isValidInteger } from "../../../helpers/number";

interface Props {
  isLoading: boolean;
  onClose(): void;
  onConfirm(sensorInput: SensorInput): void;
}

interface CreateSensorForm {
  name: string;
  sensor: string;
  min: string;
  max: string;
}

export function CreateSensor({ isLoading, onClose, onConfirm }: Props) {
  const { register, errors, getValues } = useForm<CreateSensorForm>();

  return (
    <Dialog
      isShown
      title="Créer un senseur"
      intent="success"
      isConfirmLoading={isLoading}
      confirmLabel="Créer"
      cancelLabel="Annuler"
      onCloseComplete={onClose}
      onConfirm={() => {
        const { name, sensor, min, max } = getValues();

        onConfirm({
          name,
          sensor,
          min: Number(min),
          max: Number(max),
        });
      }}
    >
      <TextInputField
        ref={register}
        name="name"
        label="Nom"
        description="Un nom arbirtraire représentant le senseur"
        placeholder="Capteur Lumière 1"
      />
      <TextInputField
        ref={register}
        name="sensor"
        label="Adresse"
        description="Un identifiant unique numérique qui cible le senseur"
        placeholder="36"
      />
      <TextInputField
        ref={register({ validate: (value) => isValidInteger(value) })}
        name="min"
        label="Minimum"
        description="Valeur minimum du senseur"
        placeholder="0"
        validationMessage={errors.min && "Veuillez entrer un nombre entier"}
      />
      <TextInputField
        ref={register}
        name="max"
        label="Maximum"
        description="Valeur maximum du senseur"
        placeholder="1"
        validationMessage={errors.max && "Veuillez entrer un nombre entier"}
      />
    </Dialog>
  );
}
