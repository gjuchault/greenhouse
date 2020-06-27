import { Request, Response } from 'express'
import * as z from 'zod'
import {
  listRulesAndCommands,
  createCommand,
  createRule,
} from '../services/rules'

export async function handleRulesAndCommands(req: Request, res: Response) {
  const rulesAndCommands = await listRulesAndCommands()

  res.status(200).json(rulesAndCommands)
}

const createCommandBodySchema = z.object({
  target: z.string(),
  value: z.string(),
  expiresIn: z.string(),
})
type CreateCommandBody = z.infer<typeof createCommandBodySchema>

export async function handleCreateCommand(req: Request, res: Response) {
  let body: CreateCommandBody

  try {
    body = createCommandBodySchema.parse(req.body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        outcome: 'notCreated',
        reason: 'invalidBody',
      })
    }

    throw err
  }

  await createCommand(body.target, body.value, body.expiresIn)

  res.status(200).end()
}

const createRuleBodySchema = z.object({
  rule: z.string(),
  priority: z.number(),
})
type CreateRuleBody = z.infer<typeof createRuleBodySchema>

export async function handleCreateRule(req: Request, res: Response) {
  let body: CreateRuleBody

  try {
    body = createRuleBodySchema.parse(req.body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        outcome: 'notCreated',
        reason: 'invalidBody',
      })
    }

    throw err
  }

  await createRule(body.rule, body.priority)

  res.status(200).end()
}
