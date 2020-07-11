export function keyBy<K, T>(list: T[], iteratee: (item: T) => K): Map<K, T> {
  return keyByWith(list, iteratee, (item) => item)
}

export function keyByWith<K, T, R>(
  list: T[],
  iteratee: (item: T) => K,
  reshaper: (item: T) => R
): Map<K, R> {
  const output = new Map<K, R>()

  for (const item of list) {
    output.set(iteratee(item), reshaper(item))
  }

  return output
}

export function groupBy<K, T>(
  list: T[],
  iteratee: (item: T) => K
): Map<K, T[]> {
  return groupByWith(list, iteratee, (item) => item)
}

export function groupByWith<K, T, R>(
  list: T[],
  iteratee: (item: T) => K,
  reshaper: (item: T) => R
): Map<K, R[]> {
  const output = new Map<K, R[]>()

  for (const item of list) {
    const key = iteratee(item)
    const subList = output.get(key) || []

    output.set(key, [...subList, reshaper(item)])
  }

  return output
}
