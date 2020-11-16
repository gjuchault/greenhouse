import { useEffect } from "react";

export function useAsyncEffect<TResult>(
  effect: () => Promise<TResult>,
  dependencies: unknown[] = []
) {
  useEffect(function () {
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
