import { Request, Response } from 'express'
import * as z from 'zod'
import {
  listEmitterSensors,
  createEmitterSensor,
  removeEmitterSensor,
} from '../services/sensors'

export async function handleListEmitterSensors(_: Request, res: Response) {
  const emitterSensors = await listEmitterSensors()

  res.status(200).json(Array.from(emitterSensors))
}

export async function handleCreateEmitterSensor(req: Request, res: Response) {
  const emitterSensorInputSchema = z.object({
    sensor: z.string(),
    name: z.string(),
    min: z.number(),
    max: z.number(),
  })

  const result = emitterSensorInputSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json(result.error)
  }

  await createEmitterSensor(result.data)

  res.status(204).end()
}

export async function handleRemoveEmitterSensor(
  req: Request<{ id: string }>,
  res: Response
) {
  await removeEmitterSensor(req.params.id)
  res.status(204).end()
}
