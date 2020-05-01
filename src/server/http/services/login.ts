import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { log } from '../../log'
import { createStorage } from '../../storage'

type LoginOutcome =
  | { outcome: 'notLoggedIn'; reason: 'userNotFound' }
  | { outcome: 'notLoggedIn'; reason: 'invalidPassword' }
  | { outcome: 'loggedIn'; name: string; token: string }

export async function login(
  name: string,
  password: string
): Promise<LoginOutcome> {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in .env')
  }

  const storage = await createStorage()
  const user = await storage.getUserByName(name)

  if (!user) {
    return {
      outcome: 'notLoggedIn',
      reason: 'userNotFound',
    }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return {
      outcome: 'notLoggedIn',
      reason: 'invalidPassword',
    }
  }

  log('login', `${user.name} logged in`)

  return {
    outcome: 'loggedIn',
    name: user.name,
    token: jwt.sign(user.id, process.env.JWT_SECRET),
  }
}
