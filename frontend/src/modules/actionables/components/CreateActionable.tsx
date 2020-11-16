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
  onClose(): void;
  onConfirm(actionable: ActionableInput): void;
}

interface CreateActionableForm {
  name: string;
  target: string;
  range: string;
}

export function CreateActionable({ isLoading, onClose, onConfirm }: Props) {
  const { register, getValues } = useForm<CreateActionableForm>();
  const [range01, setRange01] = useState("0");
  const [defaultValue, setDefaultValue] = useState("");

  const values = getValues();

  return (
    <Dialog
      isShown
      title="Créer un actionnable"
      intent="success"
      isConfirmLoading={isLoading}
      confirmLabel="Créer"
      cancelLabel="Annuler"
      onCloseComplete={onClose}
      onConfirm={() => {
        const { name, target, range } = getValues();

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
          value={range01}
          onChange={(value) => setRange01(value.toString())}
        />
      </FormField>
      {values.range === "0-1" && (
        <FormField marginBottom={24} label="Valeur par défaut">
          <SegmentedControl
            width={240}
            options={[
              { label: "0", value: "0" },
              { label: "1", value: "1" },
            ]}
            value={defaultValue}
            onChange={(value) => setDefaultValue(value.toString())}
          />
        </FormField>
      )}
      {values.range === "1-1024" && (
        <TextInputField
          name="defaultValue"
          ref={register}
          label="Valeur par défaut"
          placeholder="543"
        />
      )}
    </Dialog>
  );
}
