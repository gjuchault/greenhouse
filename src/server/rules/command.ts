export type Command = {
  id: string
  target: string
  value: string
  expiresIn: Date
}

export const reshapeCommand = ({
  id,
  target,
  value,
  expires_in,
}: {
  id: string
  target: string
  value: string
  expires_in: number
}) => ({
  id,
  target,
  value,
  expiresIn: new Date(expires_in),
})
