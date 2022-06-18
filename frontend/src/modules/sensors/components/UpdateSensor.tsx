import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, TextInputField } from "evergreen-ui";
import { SensorInput, sensorNamePattern, sensorSensorPattern } from "../sensor";
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

interface UpdateSensorFormErrors {
  name?: boolean;
  sensor?: boolean;
  min?: boolean;
  max?: boolean;
}

export function UpdateSensor({
  isLoading,
  initialValues,
  onClose,
  onConfirm,
}: Props) {
  const isUpdateMode = Boolean(initialValues);
  const { register, getValues } = useForm<UpdateSensorForm>({
    defaultValues: {
      ...initialValues,
      min: initialValues?.range.min.toString(),
      max: initialValues?.range.max.toString(),
    },
  });

  const [errors, setErrors] = useState<UpdateSensorFormErrors>({});

  function handleValidation(values: UpdateSensorForm) {
    const errors: UpdateSensorFormErrors = {};

    if (!sensorNamePattern.test(values.name)) {
      errors.name = true;
    }

    if (!sensorSensorPattern.test(values.sensor)) {
      errors.sensor = true;
    }

    setErrors(errors);

    return errors;
  }

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

        const errors = handleValidation({ name, sensor, min, max });

        if (errors.name || errors.sensor) {
          return;
        }

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
        {...register("name")}
        label="Nom"
        isInvalid={errors.name}
        validationMessage={errors.name ? "Nom invalide" : undefined}
        description="Un nom arbirtraire représentant le senseur"
        placeholder="Capteur Lumière 1"
      />
      <TextInputField
        {...register("sensor")}
        label="Adresse"
        isInvalid={errors.sensor}
        validationMessage={errors.sensor ? "Identifiant invalide" : undefined}
        description="Un identifiant unique numérique qui cible le senseur"
        placeholder="36"
      />
      <TextInputField
        {...register("min", { validate: (value) => isValidInteger(value) })}
        label="Minimum"
        description="Valeur minimum du senseur"
        placeholder="0"
        validationMessage={errors.min && "Veuillez entrer un nombre entier"}
      />
      <TextInputField
        {...register("max")}
        label="Maximum"
        description="Valeur maximum du senseur"
        placeholder="1"
        validationMessage={errors.max && "Veuillez entrer un nombre entier"}
      />
    </Dialog>
  );
}
