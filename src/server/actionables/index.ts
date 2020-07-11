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
