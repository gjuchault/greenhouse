import { Request, Response } from 'express'
import { sensors } from '../services/sensors'

export async function handleSensors(req: Request, res: Response) {
  const lastSensorsValues = await sensors()

  res.status(200).json(lastSensorsValues)
}
