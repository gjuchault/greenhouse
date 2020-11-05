export interface Actionable {
  id: string
  target: string
  name: string
  valueType: {
    range: '0-1' | '1-1024'
    default: string
  }
  lastAction?: {
    value: string
    sentAt: string
  }
}

export interface ActionableInput {
  target: string
  name: string
  valueType: {
    range: '0-1' | '1-1024'
    default: string
  }
}

export function reshapeActionable(rawActionable: any): Actionable {
  return {
    id: rawActionable.id,
    name: rawActionable.name,
    target: rawActionable.target,
    valueType: {
      range: rawActionable.value,
      default: rawActionable.default_value,
    },
    lastAction: rawActionable.last_value
      ? {
          value: rawActionable.last_value,
          sentAt: rawActionable.last_value_sent_at,
        }
      : undefined,
  }
}
