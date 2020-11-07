import React, { useState, useMemo } from 'react'
import { Dialog, TextInputField } from 'evergreen-ui'
import { EmitterSensorInput } from '../../models'

interface Props {
  isLoading: boolean
  onClose(): void
  onConfirm(emitterSensor: EmitterSensorInput): void
}

export function CreateEmitterSensor({ isLoading, onClose, onConfirm }: Props) {
  const [name, setName] = useState('')
  const [sensor, setSensor] = useState('')
  const [min, setMin] = useState('0')
  const [max, setMax] = useState('1')

  const isMinValid = useMemo(
    () => Number.isFinite(Number(min)) && !min.includes('e'),
    [min]
  )
  const isMaxValid = useMemo(
    () => Number.isFinite(Number(max)) && !min.includes('e'),
    [max]
  )

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
        if (!isMinValid || !isMaxValid) {
          return
        }

        onConfirm({
          name,
          sensor,
          min: Number(min),
          max: Number(max),
        })
      }}
    >
      <TextInputField
        label="Nom"
        description="Un nom arbirtraire représentant le senseur"
        placeholder="Capteur Lumière 1"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setName(e.target.value)
        }
        value={name}
      />
      <TextInputField
        label="Adresse"
        description="Un identifiant unique numérique qui cible le senseur"
        placeholder="36"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSensor(e.target.value)
        }
        value={sensor}
      />
      <TextInputField
        label="Minimum"
        description="Valeur minimum du senseur"
        placeholder="0"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setMin(e.target.value)
        }
        value={min}
        validationMessage={!isMinValid && 'Veuillez entrer un nombre entier'}
      />
      <TextInputField
        label="Maximum"
        description="Valeur maximum du senseur"
        placeholder="1"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setMax(e.target.value)
        }
        value={max}
        validationMessage={!isMaxValid && 'Veuillez entrer un nombre entier'}
      />
    </Dialog>
  )
}
