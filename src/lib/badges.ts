import type { Badge, Experiment, LabEntry, OrganicReading } from '../types';

export function earnedBadges(
  badges: Badge[],
  entries: LabEntry[],
  readings: OrganicReading[],
  experiments: Experiment[],
): Badge[] {
  const completedExperimentIds = new Set(
    entries.filter((entry) => entry.outcome === 'worked').map((entry) => entry.experimentId),
  );
  const measuredOrganicIds = new Set(readings.map((reading) => reading.organicId));

  return badges.filter((badge) => {
    switch (badge.criteria.type) {
      case 'complete-experiment':
        return completedExperimentIds.has(badge.criteria.experimentId);
      case 'first-light':
        return completedExperimentIds.has('first-light');
      case 'organics-measured':
        return measuredOrganicIds.size >= badge.criteria.count;
      case 'complete-track': {
        const track = badge.criteria.track;
        const trackExperiments = experiments.filter((experiment) => experiment.track === track);
        return trackExperiments.length > 0 && trackExperiments.every((experiment) => completedExperimentIds.has(experiment.id));
      }
      default:
        return false;
    }
  });
}
