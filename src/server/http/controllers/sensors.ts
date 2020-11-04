import { Request, Response } from 'express'
import { listEmitterSensors } from '../services/sensors'

export async function handleListEmitterSensors(_: Request, res: Response) {
  const emitterSensors = await listEmitterSensors()

  res.status(200).json(Array.from(emitterSensors))
}
