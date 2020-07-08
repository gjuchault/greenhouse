import { Request, Response } from 'express'
import { listActionables, listEmitterSensors } from '../services/sensors'

export async function handleListActionables(req: Request, res: Response) {
  const actionables = await listActionables()

  res.status(200).json(Array.from(actionables))
}

export async function handleListEmitterSensors(req: Request, res: Response) {
  const emitterSensors = await listEmitterSensors()

  res.status(200).json(Array.from(emitterSensors))
}
