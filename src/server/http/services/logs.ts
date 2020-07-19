import { Request, Response } from 'express'
import { lruCache } from '../../log'

export function handleGetLogs(_: Request, res: Response) {
  res.status(200).json(lruCache)
}
