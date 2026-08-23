import { useEffect, useState } from 'react';
import type { LabEntry } from '../types';

const STORAGE_KEY = 'breadboard-buddy:notebook';

let sharedEntries: LabEntry[] | null = null;
const subscribers = new Set<(entries: LabEntry[]) => void>();

function isLabEntry(value: unknown): value is LabEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.experimentId === 'string' &&
    typeof entry.startedAt === 'string' &&
    (entry.completedAt === undefined || typeof entry.completedAt === 'string') &&
    (entry.outcome === 'worked' || entry.outcome === 'partly' || entry.outcome === 'did-not-work' || entry.outcome === 'in-progress') &&
    Array.isArray(entry.photoKeys) && entry.photoKeys.every((key) => typeof key === 'string')
  );
}

function readEntries(): LabEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isLabEntry) ? parsed : [];
  } catch {
    return [];
  }
}

function currentEntries(): LabEntry[] {
  if (sharedEntries === null) sharedEntries = readEntries();
  return sharedEntries;
}

function publish(entries: LabEntry[]) {
  sharedEntries = entries;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // The notebook remains usable in memory if browser storage is unavailable.
    }
  }
  for (const subscriber of subscribers) subscriber(entries);
}

export function useNotebook() {
  const [entries, setEntries] = useState<LabEntry[]>(currentEntries);

  useEffect(() => {
    subscribers.add(setEntries);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      sharedEntries = readEntries();
      for (const subscriber of subscribers) subscriber(sharedEntries);
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      subscribers.delete(setEntries);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const startEntry = (experimentId: string, scientist?: string): LabEntry => {
    const entry: LabEntry = {
      id: crypto.randomUUID(),
      experimentId,
      startedAt: new Date().toISOString(),
      outcome: 'in-progress',
      scientist: scientist?.trim() || undefined,
      photoKeys: [],
    };
    publish([...currentEntries(), entry]);
    return entry;
  };

  const completeEntry = (
    id: string,
    outcome: Exclude<LabEntry['outcome'], 'in-progress'>,
  ): LabEntry | null => {
    let completed: LabEntry | null = null;
    const next = currentEntries().map((entry) => {
      if (entry.id !== id) return entry;
      completed = { ...entry, outcome, completedAt: new Date().toISOString() };
      return completed;
    });
    if (completed) publish(next);
    return completed;
  };

  const updateEntry = (id: string, patch: Partial<Omit<LabEntry, 'id'>>) => {
    publish(currentEntries().map((entry) => entry.id === id ? { ...entry, ...patch, id: entry.id } : entry));
  };

  const deleteEntry = (id: string) => {
    publish(currentEntries().filter((entry) => entry.id !== id));
  };

  return { entries, startEntry, completeEntry, updateEntry, deleteEntry };
}
