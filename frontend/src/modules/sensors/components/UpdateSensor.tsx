import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, TextInputField } from "evergreen-ui";
import { SensorInput } from "../sensor";
import { isValidInteger } from "../../../helpers/number";

interface Props {
  isLoading: boolean;
  initialValues?: SensorInput;
  onClose(): void;
  onConfirm(sensorInput: SensorInput): void;
}

interface UpdateSensorForm {
  name: string;
  sensor: string;
  min: string;
  max: string;
}

export function UpdateSensor({
  isLoading,
  initialValues,
  onClose,
  onConfirm,
}: Props) {
  const isUpdateMode = Boolean(initialValues);
  const { register, errors, getValues } = useForm<UpdateSensorForm>({
    defaultValues: {
      ...initialValues,
      min: initialValues?.range.min.toString(),
      max: initialValues?.range.max.toString(),
    },
  });

  return (
    <Dialog
      isShown
      title={isUpdateMode ? "Éditer un senseur" : "Créer un senseur"}
      intent="success"
      isConfirmLoading={isLoading}
      confirmLabel={isUpdateMode ? "Éditer" : "Créer"}
      cancelLabel="Annuler"
      onCloseComplete={onClose}
      onConfirm={() => {
        const { name, sensor, min, max } = getValues();

        onConfirm({
          name,
          sensor,
          range: {
            min: Number(min),
            max: Number(max),
          },
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
