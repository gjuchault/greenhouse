import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  TextInputField,
  FormField,
  SegmentedControl,
} from "evergreen-ui";
import { commandInputValuePattern, isExpiresAtValid } from "../actionable";
import {
  dateToInputDateString,
  inputDateStringToDate,
} from "../../../helpers/date";

interface Props {
  range: "0-1" | "1-1024";
  isLoading: boolean;
  onClose(): void;
  onConfirm(actionable: SendCommandForm): void;
}

interface SendCommandForm {
  value: number;
  expiresAt: string;
}

interface SendCommandFormErrors {
  value?: boolean;
  expiresAt?: boolean;
}

const fiveMinutes = 5 * 60 * 1000;

export function SendCommand({ range, isLoading, onClose, onConfirm }: Props) {
  const { register, getValues } = useForm<SendCommandForm>({
    defaultValues: {
      expiresAt: dateToInputDateString(new Date(Date.now() + fiveMinutes)),
    },
  });

  const [value, setValue] = useState<number>(1);

  const [errors, setErrors] = useState<SendCommandFormErrors>({});

  function handleValidation(values: SendCommandForm) {
    const errors: SendCommandFormErrors = {};

    if (!commandInputValuePattern.test(value.toString())) {
      errors.value = true;
    }

    if (!isExpiresAtValid(values.expiresAt)) {
      errors.expiresAt = true;
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
        const { expiresAt } = getValues();

        const errors = handleValidation({ value, expiresAt });
        const expiresAtDate = inputDateStringToDate(expiresAt);

        if (errors.value || errors.expiresAt || !expiresAtDate) {
          return;
        }

        onConfirm({
          value,
          expiresAt: expiresAtDate.toISOString(),
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
        name="expiresAt"
        type="datetime-local"
        min={new Date().toISOString().slice(0, -5)}
        ref={register}
        isInvalid={errors.expiresAt}
        validationMessage={errors.expiresAt ? "Expiration invalide" : undefined}
        description="Le moment à partir duquel la commande expire et le moteur de règle reprend la priorité"
      />
    </Dialog>
  );
}
