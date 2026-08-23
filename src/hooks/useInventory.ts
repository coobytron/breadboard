import { useEffect, useState } from 'react';
import type { InventoryItem } from '../types';
import { hasEnough, setQuantity as setInventoryQuantity } from '../lib/inventory';

const STORAGE_KEY = 'breadboard-buddy:inventory';

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

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(readInventory);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    } catch {
      // Storage can be unavailable in private/restricted browser modes; keep the in-memory state usable.
    }
  }, [inventory]);

  const setQuantity = (partId: string, quantity: number) => {
    setInventory((current) => setInventoryQuantity(current, partId, quantity));
  };

  const has = (required: InventoryItem[]) => hasEnough(inventory, required);

  return { inventory, setQuantity, has };
}
