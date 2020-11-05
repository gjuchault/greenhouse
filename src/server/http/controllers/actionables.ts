import { Request, Response } from 'express'
import * as z from 'zod'
import {
  listActionables,
  createActionable,
  removeActionable,
} from '../services/actionables'

export async function handleListActionables(_: Request, res: Response) {
  const actionables = await listActionables()

  res.status(200).json(Array.from(actionables))
}

export async function handleCreateActionable(req: Request, res: Response) {
  const actionableInputSchema = z.object({
    target: z.string(),
    name: z.string(),
    valueType: z.object({
      range: z.union([z.literal('0-1'), z.literal('1-1024')]),
      default: z.string(),
    }),
  })

  const result = actionableInputSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json(result.error)
  }

  await createActionable(result.data)

  res.status(204).end()
}

export async function handleRemoveActionable(
  req: Request<{ id: string }>,
  res: Response
) {
  await removeActionable(req.params.id)
  res.status(204).end()
}
