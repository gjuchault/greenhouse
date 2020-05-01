import { cache } from '../../cache'

export async function sensors() {
  return Array.from(cache.entries())
}
