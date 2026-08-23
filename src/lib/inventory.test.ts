import { describe, expect, it } from 'vitest';
import type { InventoryItem } from '../types';
import { hasEnough, missingParts, setQuantity } from './inventory';

describe('inventory helpers', () => {
  it('hasEnough is true when quantities match exactly', () => {
    const inventory: InventoryItem[] = [{ partId: 'led-red', quantity: 1 }];
    expect(hasEnough(inventory, [{ partId: 'led-red', quantity: 1 }])).toBe(true);
  });

  it('hasEnough is false when one part is short by one', () => {
    const inventory: InventoryItem[] = [{ partId: 'jumper-wire', quantity: 1 }];
    expect(hasEnough(inventory, [{ partId: 'jumper-wire', quantity: 2 }])).toBe(false);
  });

  it('missingParts reports the shortfall amount', () => {
    const inventory: InventoryItem[] = [{ partId: 'jumper-wire', quantity: 1 }];
    expect(missingParts(inventory, [{ partId: 'jumper-wire', quantity: 3 }])).toEqual([
      { partId: 'jumper-wire', quantity: 2 },
    ]);
  });

  it('setQuantity removes an entry when quantity is zero', () => {
    const inventory: InventoryItem[] = [{ partId: 'led-red', quantity: 1 }];
    expect(setQuantity(inventory, 'led-red', 0)).toEqual([]);
  });

  it('setQuantity does not mutate the input array or items', () => {
    const inventory: InventoryItem[] = [{ partId: 'led-red', quantity: 1 }];
    const before = structuredClone(inventory);
    const next = setQuantity(inventory, 'led-red', 2);

    expect(inventory).toEqual(before);
    expect(next).toEqual([{ partId: 'led-red', quantity: 2 }]);
    expect(next).not.toBe(inventory);
    expect(next[0]).not.toBe(inventory[0]);
  });

  it('combines duplicate quantities when checking requirements', () => {
    expect(
      hasEnough(
        [
          { partId: 'jumper-wire', quantity: 1 },
          { partId: 'jumper-wire', quantity: 1 },
        ],
        [{ partId: 'jumper-wire', quantity: 2 }],
      ),
    ).toBe(true);
  });
});
