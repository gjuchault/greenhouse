import { Request, Response } from 'express'
import { listSensorValues, listReceiverSensors } from '../services/sensors'

export async function handleSensors(req: Request, res: Response) {
  const lastSensorsValues = await listSensorValues()

  res.status(200).json(lastSensorsValues)
}

export async function handleListReceiverSensors(req: Request, res: Response) {
  const receiverSensors = await listReceiverSensors()

  res.status(200).json(receiverSensors)
}
