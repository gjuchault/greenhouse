import React, { useState } from 'react'
import {
  Dialog,
  TextInputField,
  FormField,
  SegmentedControl,
} from 'evergreen-ui'
import { ActionableInput, isValidActionableRange } from '../../models'

interface Props {
  isLoading: boolean
  onClose(): void
  onConfirm(actionable: ActionableInput): void
}

export function CreateActionable({ isLoading, onClose, onConfirm }: Props) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [range, setRange] = useState<'0-1' | '1-1024'>('0-1')
  const [defaultValue, setDefaultValue] = useState('0')

  return (
    <Dialog
      isShown
      title="Créer un actionnable"
      intent="success"
      isConfirmLoading={isLoading}
      confirmLabel="Créer"
      cancelLabel="Annuler"
      onCloseComplete={onClose}
      onConfirm={() =>
        onConfirm({ name, target, valueType: { range, default: defaultValue } })
      }
    >
      <TextInputField
        label="Nom"
        description="Un nom arbirtraire représentant l'actionnable"
        placeholder="Moteur 1"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setName(e.target.value)
        }
        value={name}
      />
      <TextInputField
        label="Adresse"
        description="Un identifiant unique numérique qui cible l'actionnable"
        placeholder="101"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTarget(e.target.value)
        }
        value={target}
      />
      <FormField
        marginBottom={24}
        label="Type de valeur"
        description="Choisir le type de valeur que l'actionnable peut recevoir"
      >
        <SegmentedControl
          width={240}
          options={[
            { label: '0-1', value: '0-1' },
            { label: '1-1024', value: '1-1024' },
          ]}
          value={range}
          onChange={(value) => {
            if (isValidActionableRange(value)) {
              setRange(value)
              setDefaultValue(value === '0-1' ? '0' : '1')
            }
          }}
        />
      </FormField>
      {range === '0-1' && (
        <FormField marginBottom={24} label="Valeur par défaut">
          <SegmentedControl
            width={240}
            options={[
              { label: '0', value: '0' },
              { label: '1', value: '1' },
            ]}
            value={defaultValue}
            onChange={(value) => setDefaultValue(value)}
          />
        </FormField>
      )}
      {range === '1-1024' && (
        <TextInputField
          label="Valeur par défaut"
          placeholder="543"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDefaultValue(e.target.value)
          }
          value={defaultValue}
        />
      )}
    </Dialog>
  )
}
