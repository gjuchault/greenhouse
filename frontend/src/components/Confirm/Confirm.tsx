import React from "react";
import { Dialog } from "evergreen-ui";

interface Props {
  description: string;
  confirmationText?: string;
  cancellationText?: string;
  isLoading: boolean;
  onClose(): void;
  onConfirm(): void;
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
    <Dialog
      isShown
      title="Confirmation"
      intent="danger"
      isConfirmLoading={isLoading}
      onCloseComplete={onClose}
      onConfirm={onConfirm}
      confirmLabel={confirmationText || "Supprimer"}
      cancelLabel={cancellationText || "Annuler"}
    >
      {description}
    </Dialog>
  );
}
