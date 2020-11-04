import React from 'react'
import { Pane, Dialog } from 'evergreen-ui'

interface Props {
  description: string
  confirmationText?: string
  cancellationText?: string
  isLoading: boolean
  onClose(): void
  onConfirm(): void
}

export function Confirm({
  description,
  confirmationText,
  cancellationText,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Pane>
      <Dialog
        isShown
        title="Confirmation"
        intent="danger"
        isConfirmLoading={isLoading}
        onCloseComplete={onClose}
        onConfirm={onConfirm}
        confirmLabel={confirmationText || 'Supprimer'}
        cancelLabel={cancellationText || 'Annuler'}
      >
        {description}
      </Dialog>
    </Pane>
  )
}
