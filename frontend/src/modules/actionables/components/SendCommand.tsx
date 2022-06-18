import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  TextInputField,
  FormField,
  SegmentedControl,
} from "evergreen-ui";
import ms from "ms";
import { commandInputValuePattern } from "../actionable";

interface Props {
  range: "0-1" | "1-1024";
  isLoading: boolean;
  onClose(): void;
  onConfirm(actionable: SendCommandForm): void;
}

interface SendCommandForm {
  value: number;
  expiresIn: string;
}

interface SendCommandFormErrors {
  value?: boolean;
  expiresIn?: boolean;
}

export function SendCommand({ range, isLoading, onClose, onConfirm }: Props) {
  const { register, getValues } = useForm<SendCommandForm>({
    defaultValues: {
      expiresIn: "30s",
    },
  });

  const [value, setValue] = useState<number>(1);

  const [errors, setErrors] = useState<SendCommandFormErrors>({});

  function handleValidation(values: SendCommandForm) {
    const errors: SendCommandFormErrors = {};

    if (!commandInputValuePattern.test(value.toString())) {
      errors.value = true;
    }

    if (ms(values.expiresIn) === undefined) {
      errors.expiresIn = true;
    }

    setErrors(errors);

    return errors;
  }

  return (
    <Dialog
      isShown
      title="Envoyer une commande"
      intent="success"
      isConfirmLoading={isLoading}
      confirmLabel="Envoyer"
      cancelLabel="Annuler"
      onCloseComplete={onClose}
      onConfirm={() => {
        const { expiresIn } = getValues();

        const errors = handleValidation({ value, expiresIn });

        if (errors.value || errors.expiresIn) {
          return;
        }

        onConfirm({
          value,
          expiresIn,
        });
      }}
    >
      {range === "0-1" && (
        <FormField marginBottom={24} label="Valeur">
          <SegmentedControl
            width={240}
            options={[
              { label: "0", value: 0 },
              { label: "1", value: 1 },
            ]}
            value={value}
            onChange={(value) => {
              if (typeof value !== "number") {
                throw new Error(
                  `Expected number for value, but got ${typeof value}`
                );
              }
              setValue(value);
            }}
          />
        </FormField>
      )}
      {range === "1-1024" && (
        <TextInputField
          name="value"
          label="Valeur"
          placeholder="543"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(Number(e.target.value));
          }}
        />
      )}

      <TextInputField
        label="Expiration"
        name="expiresIn"
        type="string"
        ref={register}
        isInvalid={errors.expiresIn}
        validationMessage={errors.expiresIn ? "Expiration invalide" : undefined}
        description="Le moment à partir duquel la commande expire et le moteur de règle reprend la priorité"
      />
    </Dialog>
  );
}
