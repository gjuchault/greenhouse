export interface EmitterSensor {
  id: string
  sensor: string
  name: string
  range: {
    min: number
    max: number
  }
  lastStatement?: {
    value: string
    sentAt: string
    source: string
  }
}

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

export type ActionableInput = Omit<Actionable, 'id' | 'lastAction'>

export function isValidActionableRange(input: any): input is '0-1' | '1-1024' {
  return ['0-1', '1-1024'].includes(input)
}

export interface Rule {
  id: string
  rule: string
  priority: number
}

export interface Command {
  id: string
  target: string
  value: string
  expiresIn: string
}
