import type { InventoryItem } from '../types';

function quantityMap(items: InventoryItem[]): Map<string, number> {
  const quantities = new Map<string, number>();

  for (const item of items) {
    quantities.set(item.partId, (quantities.get(item.partId) ?? 0) + item.quantity);
  }

  return quantities;
}

export function hasEnough(inventory: InventoryItem[], required: InventoryItem[]): boolean {
  const owned = quantityMap(inventory);
  const needed = quantityMap(required);

  return [...needed].every(([partId, quantity]) => (owned.get(partId) ?? 0) >= quantity);
}

export function missingParts(inventory: InventoryItem[], required: InventoryItem[]): InventoryItem[] {
  const owned = quantityMap(inventory);
  const needed = quantityMap(required);

  return [...needed].flatMap(([partId, quantity]) => {
    const shortfall = quantity - (owned.get(partId) ?? 0);
    return shortfall > 0 ? [{ partId, quantity: shortfall }] : [];
  });
}

export function setQuantity(
  inventory: InventoryItem[],
  partId: string,
  quantity: number,
): InventoryItem[] {
  if (quantity <= 0) {
    return inventory.filter((item) => item.partId !== partId).map((item) => ({ ...item }));
  }

  let found = false;
  const next = inventory.map((item) => {
    if (item.partId !== partId) return { ...item };
    found = true;
    return { partId, quantity };
  });

  return found ? next : [...next, { partId, quantity }];
}
