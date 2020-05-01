import { Request, Response } from 'express'
import * as z from 'zod'
import { login } from '../services/login'

const bodySchema = z.object({
  user: z.string(),
  password: z.string(),
})

type Body = z.infer<typeof bodySchema>

export async function handleLogin(req: Request, res: Response) {
  let body: Body

  try {
    body = bodySchema.parse(req.body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        outcome: 'notLoggedIn',
        reason: 'invalidBody',
      })
    }

    throw err
  }

  const loginResult = await login(body.user, body.password)

  if (loginResult.outcome === 'notLoggedIn') {
    return res.status(400).json(loginResult)
  }

  res.status(200).json(loginResult)
}
