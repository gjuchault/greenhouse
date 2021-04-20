export function removeHoles<TItem>(items: (TItem | undefined)[]): TItem[] {
  return items.filter((item): item is TItem => Boolean(item));
}
