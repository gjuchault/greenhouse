import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in .env')
  }

  const bearer = req.headers['authorization']

  if (!bearer) {
    return res.status(401).end()
  }

  const [type, token] = bearer.split(' ')

  if (type.toLowerCase() !== 'bearer') {
    return res.status(401).end()
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    return res.status(401).end()
  }

  return next()
}
