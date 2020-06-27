import { Request, Response } from 'express'
import {
  listSensorValues,
  listActionables,
  listEmitterSensors,
} from '../services/sensors'

export async function handleSensors(req: Request, res: Response) {
  const lastSensorsValues = await listSensorValues()

  res.status(200).json(lastSensorsValues)
}

export async function handleListActionables(req: Request, res: Response) {
  const actionables = await listActionables()

  res.status(200).json(actionables)
}

export async function handleListEmitterSensors(req: Request, res: Response) {
  const emitterSensors = await listEmitterSensors()

  res.status(200).json(emitterSensors)
}
