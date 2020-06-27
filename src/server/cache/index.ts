export const emitterCache = new Map<
  string,
  {
    value: string
    lastSentAt: string
    source: string
  }
>()

export const actionableCache = new Map<
  string,
  {
    value: string
    lastSentAt: string
  }
>()
