type Queue = Map<string, number>

type Callback = (sensor: string, value: string) => void

const interval = 1000 * 60

export const buildQueue = (onSend: Callback) => {
  const q: Queue = new Map()

  const add = (sensor: string, value: string) => {
    const lastSentAt = q.get(sensor) || 0

    if (Date.now() - lastSentAt < interval) {
      onSend(sensor, value)
    }

    q.set(sensor, Date.now())
  }

  return { add }
}
