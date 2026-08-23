import { useEffect, useState } from 'react';

function storageKey(experimentId: string): string {
  return `breadboard-buddy:progress:${experimentId}`;
}

function clampIndex(index: number, stepCount: number): number {
  if (stepCount <= 0) return 0;
  return Math.min(Math.max(0, index), stepCount - 1);
}

function readIndex(experimentId: string, stepCount: number): number {
  if (typeof window === 'undefined') return 0;

  try {
    const stored = window.localStorage.getItem(storageKey(experimentId));
    if (stored === null) return 0;
    const parsed = Number.parseInt(stored, 10);
    return Number.isFinite(parsed) ? clampIndex(parsed, stepCount) : 0;
  } catch {
    return 0;
  }
}

export function useStepProgress(experimentId: string, stepCount: number) {
  const [index, setIndex] = useState(() => readIndex(experimentId, stepCount));
  const lastIndex = Math.max(0, stepCount - 1);

  useEffect(() => {
    setIndex(readIndex(experimentId, stepCount));
  }, [experimentId, stepCount]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(experimentId), String(clampIndex(index, stepCount)));
    } catch {
      // Progress remains usable in memory if storage is unavailable.
    }
  }, [experimentId, index, stepCount]);

  const next = () => setIndex((current) => Math.min(current + 1, lastIndex));
  const back = () => setIndex((current) => Math.max(current - 1, 0));
  const reset = () => setIndex(0);

  return {
    index,
    next,
    back,
    reset,
    isFirst: index === 0,
    isLast: index === lastIndex,
  };
}
