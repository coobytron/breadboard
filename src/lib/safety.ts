import type { Hazard, HazardId, ReadingLevel } from '../types';

const severityRank: Record<Hazard['severity'], number> = {
  gate: 0,
  warn: 1,
  note: 2,
};

function resolveHazards(hazardIds: HazardId[], hazards: Hazard[]): Hazard[] {
  const byId = new Map(hazards.map((hazard) => [hazard.id, hazard]));

  return hazardIds.flatMap((hazardId) => {
    const hazard = byId.get(hazardId);
    return hazard ? [hazard] : [];
  });
}

export function isHiddenAtLevel(
  hazardIds: HazardId[],
  level: ReadingLevel,
  hazards: Hazard[],
): boolean {
  return resolveHazards(hazardIds, hazards).some((hazard) => hazard.hiddenFrom.includes(level));
}

export function needsAdultGate(hazardIds: HazardId[], hazards: Hazard[]): Hazard[] {
  return resolveHazards(hazardIds, hazards).filter((hazard) => hazard.severity === 'gate');
}

export function sortHazards(hazardIds: HazardId[], hazards: Hazard[]): Hazard[] {
  return resolveHazards(hazardIds, hazards)
    .map((hazard, index) => ({ hazard, index }))
    .sort((a, b) => severityRank[a.hazard.severity] - severityRank[b.hazard.severity] || a.index - b.index)
    .map(({ hazard }) => hazard);
}
