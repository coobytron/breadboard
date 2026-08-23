import { useEffect, useState } from 'react';
import type { OrganicReading } from '../types';

export type GuessStrength = 'strong' | 'medium' | 'weak';

export interface ReadingWithGuess extends OrganicReading {
  guess: GuessStrength;
}

type NewReading = Omit<ReadingWithGuess, 'id' | 'measuredAt'>;

const STORAGE_KEY = 'breadboard-buddy:readings';

function isGuess(value: unknown): value is GuessStrength {
  return value === 'strong' || value === 'medium' || value === 'weak';
}

function isStoredReading(value: unknown): value is ReadingWithGuess {
  if (typeof value !== 'object' || value === null) return false;
  const reading = value as Record<string, unknown>;
  return (
    typeof reading.id === 'string' &&
    typeof reading.organicId === 'string' &&
    typeof reading.measuredAt === 'string' &&
    (reading.method === 'multimeter' || reading.method === 'led-brightness') &&
    isGuess(reading.guess)
  );
}

function readStoredReadings(): ReadingWithGuess[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isStoredReading) ? parsed : [];
  } catch {
    return [];
  }
}

export function useReadings() {
  const [readings, setReadings] = useState<ReadingWithGuess[]>(readStoredReadings);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
    } catch {
      // Keep the Fruit Lab usable in memory if browser storage is unavailable.
    }
  }, [readings]);

  const addReading = (reading: NewReading) => {
    const next: ReadingWithGuess = {
      ...reading,
      id: crypto.randomUUID(),
      measuredAt: new Date().toISOString(),
    };
    setReadings((current) => [...current, next]);
    return next;
  };

  const removeReading = (id: string) => {
    setReadings((current) => current.filter((reading) => reading.id !== id));
  };

  const clearAll = () => setReadings([]);

  return { readings, addReading, removeReading, clearAll };
}
