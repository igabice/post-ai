// hooks/useAsyncSafeState.ts
import { useState, useRef, useCallback } from "react";

export function useAsyncSafeState<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const isMounted = useRef(true);

  const asyncSafeSetState = useCallback((newState: T | ((prev: T) => T)) => {
    if (isMounted.current) {
      setState(newState);
    }
  }, []);

  useState(() => {
    return () => {
      isMounted.current = false;
    };
  });

  return [state, asyncSafeSetState] as const;
}
