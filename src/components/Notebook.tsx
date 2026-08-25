import { useEffect, useState } from 'react';
import { experiments } from '../content';
import { useNotebook } from '../hooks/useNotebook';
import { deletePhoto, totalBytes } from '../lib/photo-store';
import type { LabEntry, LeveledText, ReadingLevel } from '../types';
import { PhotoCapture } from './PhotoCapture';
import { PhotoStrip } from './PhotoStrip';

interface NotebookProps {
  level: ReadingLevel;
}

const outcomeEmoji: Record<LabEntry['outcome'], string> = {
  worked: '✅',
  partly: '🤔',
  'did-not-work': '❌',
  'in-progress': '⏳',
};

const STORAGE_PREFIX: LeveledText = {
  explorer: 'Pictures on this device:',
  builder: 'Photo storage on this device:',
  engineer: 'IndexedDB photo storage:',
};

const dayFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

function dayKey(entry: LabEntry): string {
  return new Date(entry.startedAt).toISOString().slice(0, 10);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Notebook({ level }: NotebookProps) {
  const { entries, updateEntry, deleteEntry } = useNotebook();
  const [photoBytes, setPhotoBytes] = useState(0);
  const experimentTitles = new Map(experiments.map((experiment) => [experiment.id, experiment.title]));
  const sorted = [...entries].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const groups = new Map<string, LabEntry[]>();

  for (const entry of sorted) {
    const key = dayKey(entry);
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }

  const refreshPhotoBytes = async () => {
    setPhotoBytes(await totalBytes());
  };

  useEffect(() => {
    void refreshPhotoBytes();
  }, [entries]);

  const handlePhotoSaved = (entry: LabEntry, key: string) => {
    updateEntry(entry.id, { photoKeys: [...entry.photoKeys, key] });
    void refreshPhotoBytes();
  };

  const handlePhotoDelete = async (entry: LabEntry, key: string) => {
    await deletePhoto(key);
    updateEntry(entry.id, { photoKeys: entry.photoKeys.filter((candidate) => candidate !== key) });
    await refreshPhotoBytes();
  };

  const handleEntryDelete = async (entry: LabEntry) => {
    await Promise.all(entry.photoKeys.map((key) => deletePhoto(key)));
    deleteEntry(entry.id);
    await refreshPhotoBytes();
  };

  return (
    <section className="notebook-print" aria-labelledby="notebook-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
        <div>
          <h2 id="notebook-title">📓 {level === 'explorer' ? 'Our science book' : 'Lab notebook'}</h2>
          <p className="sub">Everything here stays on this device.</p>
        </div>
        <button type="button" className="no-print" onClick={() => window.print()} style={{ minHeight: 'var(--tap)' }}>
          Print notebook
        </button>
      </div>

      {sorted.length === 0 && (
        <p>{level === 'explorer' ? 'Finish a build and it will show up here.' : 'Completed experiments will appear here.'}</p>
      )}

      {[...groups.entries()].map(([key, dayEntries]) => (
        <section key={key}>
          <h3 className="track">{dayFormatter.format(new Date(`${key}T12:00:00`))}</h3>
          {dayEntries.map((entry) => (
            <article className="card" key={entry.id}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>{outcomeEmoji[entry.outcome]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0 }}>{experimentTitles.get(entry.experimentId) ?? entry.experimentId}</h4>
                  <p className="sub" style={{ marginBottom: '0.5rem' }}>
                    {timeFormatter.format(new Date(entry.startedAt))}
                    {entry.scientist ? ` · ${entry.scientist}` : ''}
                  </p>
                  {entry.notes && <p>{entry.notes}</p>}
                  <PhotoStrip
                    photoKeys={entry.photoKeys}
                    level={level}
                    onDelete={(keyToDelete) => void handlePhotoDelete(entry, keyToDelete)}
                  />
                  <PhotoCapture
                    level={level}
                    onSaved={(savedKey) => handlePhotoSaved(entry, savedKey)}
                  />
                </div>
                <button
                  type="button"
                  className="no-print"
                  onClick={() => void handleEntryDelete(entry)}
                  aria-label={`Delete ${experimentTitles.get(entry.experimentId) ?? entry.experimentId} notebook entry`}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      ))}

      <footer className="sub no-print" style={{ marginTop: '1rem' }} aria-live="polite">
        {STORAGE_PREFIX[level]} {formatBytes(photoBytes)}
      </footer>
    </section>
  );
}
