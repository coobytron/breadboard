import { useEffect, useState } from 'react';
import type { InventoryItem } from '../types';
import { hasEnough, setQuantity as setInventoryQuantity } from '../lib/inventory';

const STORAGE_KEY = 'breadboard-buddy:inventory';

let sharedInventory: InventoryItem[] | null = null;
const subscribers = new Set<(inventory: InventoryItem[]) => void>();

function isInventoryItem(value: unknown): value is InventoryItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.partId === 'string' && typeof item.quantity === 'number' && Number.isFinite(item.quantity);
}

function readInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isInventoryItem) ? parsed : [];
  } catch {
    return [];
  }
}

function currentInventory(): InventoryItem[] {
  if (sharedInventory === null) sharedInventory = readInventory();
  return sharedInventory;
}

function publish(next: InventoryItem[]) {
  sharedInventory = next;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable in private/restricted browser modes; keep the in-memory state usable.
    }
  }

  for (const subscriber of subscribers) subscriber(next);
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(currentInventory);

  useEffect(() => {
    subscribers.add(setInventory);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      sharedInventory = readInventory();
      for (const subscriber of subscribers) subscriber(sharedInventory);
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      subscribers.delete(setInventory);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setQuantity = (partId: string, quantity: number) => {
    publish(setInventoryQuantity(currentInventory(), partId, quantity));
  };

  const has = (required: InventoryItem[]) => hasEnough(inventory, required);

  return { inventory, setQuantity, has };
}
