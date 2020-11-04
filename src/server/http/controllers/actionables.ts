import { Request, Response } from 'express'
import { listActionables, removeActionable } from '../services/actionables'

export async function handleListActionables(_: Request, res: Response) {
  const actionables = await listActionables()

  res.status(200).json(Array.from(actionables))
}

export async function handleRemoveActionable(
  req: Request<{ id: string }>,
  res: Response
) {
  await removeActionable(req.params.id)
  res.status(204).end()
}
