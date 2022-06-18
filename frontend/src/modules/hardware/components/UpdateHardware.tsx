import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, TextInputField } from "evergreen-ui";
import { Hardware, hardwareNamePattern } from "../hardware";

interface Props {
  isLoading: boolean;
  hardware: Hardware;
  onClose(): void;
  onConfirm(hardware: Hardware): void;
}

interface UpdateHardwareForm {
  name: string;
}

interface UpdateHardwareFormErrors {
  name?: boolean;
}

export function UpdateHardware({
  isLoading,
  hardware,
  onClose,
  onConfirm,
}: Props) {
  const { register, getValues } = useForm<UpdateHardwareForm>({
    defaultValues: {
      name: hardware.name,
    },
  });

  const [errors, setErrors] = useState<UpdateHardwareFormErrors>({});

  function handleValidation(values: UpdateHardwareForm) {
    const errors: UpdateHardwareFormErrors = {};

    if (!hardwareNamePattern.test(values.name)) {
      errors.name = true;
    }

    setErrors(errors);

    return errors;
  }

  return (
    <Dialog
      isShown
      title="Éditer un matériel USB"
      intent="success"
      isConfirmLoading={isLoading}
      confirmLabel="Éditer"
      cancelLabel="Annuler"
      onCloseComplete={onClose}
      onConfirm={() => {
        const { name } = getValues();

        const errors = handleValidation({ name });

        if (errors.name) {
          return;
        }

        onConfirm({
          ...hardware,
          name,
        });
      }}
    >
      <TextInputField
        label="Nom"
        {...register("name")}
        isInvalid={errors.name}
        validationMessage={errors.name ? "Nom invalide" : undefined}
        description="Un nom arbirtraire représentant le matériel USB"
        placeholder="Arduino 1"
      />
    </Dialog>
  );
}
