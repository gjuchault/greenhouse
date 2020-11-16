export class SwitchGuardError extends Error {
  constructor(callee: string, value: never) {
    super(`Unexpected value ${value} for callee ${callee}`)
  }
}
