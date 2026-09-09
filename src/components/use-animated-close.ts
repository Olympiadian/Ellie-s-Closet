"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAnimatedClose(onClosed: () => void, duration = 260) {
  const [isClosing, setIsClosing] = useState(false);
  const onClosedRef = useRef(onClosed);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    onClosedRef.current = onClosed;
  }, [onClosed]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const requestClose = useCallback(() => {
    if (isClosing) return;

    const reduceMotion =
      document.documentElement.dataset.reduceMotion === "true" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      onClosedRef.current();
      return;
    }

    setIsClosing(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setIsClosing(false);
      onClosedRef.current();
    }, duration);
  }, [duration, isClosing]);

  return { isClosing, requestClose };
}
