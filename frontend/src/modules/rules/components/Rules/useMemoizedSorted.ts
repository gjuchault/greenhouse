import { useMemo } from "react";

export function useMemoizedSorted<TItem>(
  inputMap: Map<string, TItem> | undefined,
  iteratee: (item: TItem) => string
): TItem[] {
  return useMemo(
    () =>
      inputMap
        ? Array.from(inputMap.values()).sort((left, right) => {
            return iteratee(left).localeCompare(iteratee(right));
          })
        : [],
    [inputMap, iteratee]
  );
}
