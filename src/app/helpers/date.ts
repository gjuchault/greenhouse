export const formatDate = (input: Date | string) => {
  let d = typeof input === 'string' ? new Date(input) : input

  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}
