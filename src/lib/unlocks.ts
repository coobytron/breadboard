import type { Experiment, InventoryItem } from '../types';
import { hasEnough, missingParts } from './inventory';

export function buildable(experiment: Experiment, inventory: InventoryItem[]): boolean {
  return hasEnough(inventory, experiment.requires);
}

export function nextBestPart(
  experiments: Experiment[],
  inventory: InventoryItem[],
): { partId: string; unlockCount: number } | null {
  const blocked = experiments.filter((experiment) => !buildable(experiment, inventory));
  if (blocked.length === 0) return null;

  const unlockCounts = new Map<string, number>();

  for (const experiment of blocked) {
    const missing = missingParts(inventory, experiment.requires);
    const missingPartIds = new Set(missing.map((item) => item.partId));

    for (const partId of missingPartIds) {
      unlockCounts.set(partId, (unlockCounts.get(partId) ?? 0) + 1);
    }
  }

  let best: { partId: string; unlockCount: number } | null = null;

  for (const [partId, unlockCount] of unlockCounts) {
    if (
      best === null ||
      unlockCount > best.unlockCount ||
      (unlockCount === best.unlockCount && partId.localeCompare(best.partId) < 0)
    ) {
      best = { partId, unlockCount };
    }
  }

  return best;
}
