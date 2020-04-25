import { Request, Response } from 'express'
import * as z from 'zod'

const bodySchema = z.object({
  user: z.string(),
  password: z.string(),
})

type Body = z.infer<typeof bodySchema>

export async function login(req: Request, res: Response) {
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

  res.json({
    outcome: 'loggedIn',
    token: `${body.password}${body.user}`,
  })
}
