import { useState } from 'react';
import { experiments, hazardsById } from './content';
import { READING_LEVELS, type ReadingLevel } from './types';

const LEVEL_LABELS: Record<ReadingLevel, string> = {
  explorer: '🐣 Explorer (under 6)',
  builder: '🔨 Builder (6–9)',
  engineer: '⚡ Engineer (10–13)',
};

const TRACK_LABELS: Record<string, string> = {
  basics: 'Start here',
  transistor: 'Transistors',
  laser: 'Lasers',
  fruit: '🍋 Fruit Lab',
};

/**
 * Home screen: pick your reading level, see the experiments you can build.
 *
 * This is deliberately the smallest thing that proves the content pipeline works
 * end to end. Prompt cards 02 onward build out from here.
 */
export function App() {
  const [level, setLevel] = useState<ReadingLevel>('builder');

  const tracks = [...new Set(experiments.map((e) => e.track))];
  const visible = experiments.filter((e) => {
    const gatedHazard = e.hazards.some((h) => hazardsById.get(h)?.hiddenFrom.includes(level));
    return !gatedHazard;
  });

  return (
    <div className="wrap">
      <h1>🍋 Breadboard Buddy</h1>
      <p className="sub">Pick who's building today.</p>

      <div className="levels">
        {READING_LEVELS.map((l) => (
          <button
            key={l}
            aria-pressed={level === l}
            onClick={() => setLevel(l)}
          >
            {LEVEL_LABELS[l]}
          </button>
        ))}
      </div>

      {tracks.map((track) => {
        const inTrack = visible.filter((e) => e.track === track);
        if (inTrack.length === 0) return null;
        return (
          <section key={track}>
            <h2 className="track">{TRACK_LABELS[track] ?? track}</h2>
            {inTrack.map((e) => (
              <article className="card" key={e.id}>
                <h3>{e.title}</h3>
                <p>{e.hook[level]}</p>
                <div className="meta">
                  <span className="pill">{e.estimatedMinutes} min</span>
                  <span className="pill">{e.steps.length} steps</span>
                  {e.hazards.map((h) => {
                    const hz = hazardsById.get(h);
                    if (!hz) return null;
                    return (
                      <span
                        key={h}
                        className={`pill ${hz.severity === 'gate' ? 'danger' : hz.severity === 'warn' ? 'warn' : ''}`}
                      >
                        {hz.title}
                      </span>
                    );
                  })}
                </div>
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}
