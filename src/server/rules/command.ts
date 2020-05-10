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
  expires_in: Date
}) => ({
  id,
  target,
  value,
  expiresIn: expires_in,
})
