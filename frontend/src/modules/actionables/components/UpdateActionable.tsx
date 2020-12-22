import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  TextInputField,
  FormField,
  SegmentedControl,
} from "evergreen-ui";
import { ActionableInput, isValidActionableRange } from "../actionable";

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

        if (!isValidActionableRange(range)) {
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
        description="Un nom arbirtraire représentant l'actionnable"
        placeholder="Moteur 1"
      />
      <TextInputField
        label="Adresse"
        name="target"
        ref={register}
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
