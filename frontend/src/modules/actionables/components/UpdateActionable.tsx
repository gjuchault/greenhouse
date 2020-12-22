import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  TextInputField,
  FormField,
  SegmentedControl,
} from "evergreen-ui";
import {
  ActionableInput,
  actionableNamePattern,
  actionableTargetPattern,
  isValidActionableRange,
} from "../actionable";

interface Props {
  isLoading: boolean;
  initialValues?: ActionableInput;
  onClose(): void;
  onConfirm(actionable: ActionableInput): void;
}

interface UpdateActionableForm {
  name: string;
  target: string;
  range: string;
}

interface UpdateActionableFormErrors {
  name?: boolean;
  target?: boolean;
  range?: boolean;
}

export function UpdateActionable({
  isLoading,
  initialValues,
  onClose,
  onConfirm,
}: Props) {
  const isUpdateMode = Boolean(initialValues);
  const { register, getValues } = useForm<UpdateActionableForm>({
    defaultValues: {
      name: initialValues?.name,
      target: initialValues?.target,
    },
  });
  const [range, setRange] = useState(
    initialValues?.valueType.range.toString() ?? "0-1"
  );
  const [defaultValue, setDefaultValue] = useState(
    initialValues?.valueType.default ?? 1
  );

  const [errors, setErrors] = useState<UpdateActionableFormErrors>({});

  function handleValidation(values: UpdateActionableForm) {
    const errors: UpdateActionableFormErrors = {};

    if (!actionableNamePattern.test(values.name)) {
      errors.name = true;
    }

    if (!actionableTargetPattern.test(values.target)) {
      errors.target = true;
    }

    if (!isValidActionableRange(range)) {
      errors.range = true;
    }

    setErrors(errors);

    return errors;
  }

  return (
    <Dialog
      isShown
      title={isUpdateMode ? "Éditer un actionnable" : "Créer un actionnable"}
      intent="success"
      isConfirmLoading={isLoading}
      confirmLabel={isUpdateMode ? "Éditer" : "Créer"}
      cancelLabel="Annuler"
      onCloseComplete={onClose}
      onConfirm={() => {
        const { name, target } = getValues();

        const errors = handleValidation({ name, target, range });

        if (
          errors.name ||
          errors.range ||
          errors.target ||
          // typescript re-check
          !isValidActionableRange(range)
        ) {
          return;
        }

        onConfirm({
          name,
          target,
          valueType: {
            range,
            default: defaultValue,
          },
        });
      }}
    >
      <TextInputField
        label="Nom"
        name="name"
        ref={register}
        isInvalid={errors.name}
        validationMessage={errors.name ? "Nom invalide" : undefined}
        description="Un nom arbirtraire représentant l'actionnable"
        placeholder="Moteur 1"
      />
      <TextInputField
        label="Adresse"
        name="target"
        ref={register}
        isInvalid={errors.target}
        validationMessage={errors.target ? "Identifiant invalide" : undefined}
        description="Un identifiant unique numérique qui cible l'actionnable"
        placeholder="101"
      />
      <FormField
        marginBottom={24}
        label="Type de valeur"
        description="Choisir le type de valeur que l'actionnable peut recevoir"
      >
        <SegmentedControl
          width={240}
          options={[
            { label: "0-1", value: "0-1" },
            { label: "1-1024", value: "1-1024" },
          ]}
          value={range}
          onChange={(value) => setRange(value.toString())}
        />
      </FormField>
      {range === "0-1" && (
        <FormField marginBottom={24} label="Valeur par défaut">
          <SegmentedControl
            width={240}
            options={[
              { label: "0", value: 0 },
              { label: "1", value: 1 },
            ]}
            value={defaultValue}
            onChange={(value) => {
              if (typeof value !== "number") {
                throw new Error(
                  `Expected number for value, but got ${typeof value}`
                );
              }
              setDefaultValue(value);
            }}
          />
        </FormField>
      )}
      {range === "1-1024" && (
        <TextInputField
          name="defaultValue"
          label="Valeur par défaut"
          placeholder="543"
          value={defaultValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setDefaultValue(Number(e.target.value));
          }}
        />
      )}
    </Dialog>
  );
}
