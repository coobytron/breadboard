import { useEffect, useState } from 'react';
import { loadPhoto } from '../lib/photo-store';
import type { LeveledText, ReadingLevel } from '../types';

interface PhotoStripProps {
  photoKeys: string[];
  onDelete?: (key: string) => void;
  level?: ReadingLevel;
}

interface PhotoItem {
  key: string;
  url: string;
}

const PHOTO_STRIP_LABEL: LeveledText = {
  explorer: 'Build pictures',
  builder: 'Build photos',
  engineer: 'Notebook photo attachments',
};

const OPEN_PHOTO: LeveledText = {
  explorer: 'Open big picture',
  builder: 'Open full-size photo',
  engineer: 'Open full-size build photo',
};

const DELETE_PHOTO: LeveledText = {
  explorer: 'Remove picture',
  builder: 'Delete photo',
  engineer: 'Delete photo attachment',
};

export function PhotoStrip({ photoKeys, onDelete, level = 'builder' }: PhotoStripProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const createdUrls: string[] = [];

    const load = async () => {
      const loaded = await Promise.all(
        photoKeys.map(async (key): Promise<PhotoItem | null> => {
          const blob = await loadPhoto(key);
          if (!blob) return null;

          const url = URL.createObjectURL(blob);
          if (cancelled) {
            URL.revokeObjectURL(url);
            return null;
          }

          createdUrls.push(url);
          return { key, url };
        }),
      );

      if (!cancelled) {
        setPhotos(loaded.filter((item): item is PhotoItem => item !== null));
      }
    };

    void load();

    return () => {
      cancelled = true;
      for (const url of createdUrls) URL.revokeObjectURL(url);
    };
  }, [photoKeys]);

  if (photos.length === 0) return null;

  return (
    <div
      aria-label={PHOTO_STRIP_LABEL[level]}
      style={{
        display: 'flex',
        gap: '0.75rem',
        overflowX: 'auto',
        paddingBlock: '0.5rem',
      }}
    >
      {photos.map((photo) => (
        <figure
          key={photo.key}
          style={{
            position: 'relative',
            flex: '0 0 auto',
            margin: 0,
          }}
        >
          <a
            href={photo.url}
            target="_blank"
            rel="noreferrer"
            aria-label={OPEN_PHOTO[level]}
          >
            <img
              src={photo.url}
              alt=""
              style={{
                display: 'block',
                width: '112px',
                height: '84px',
                objectFit: 'cover',
                borderRadius: '0.5rem',
              }}
            />
          </a>
          {onDelete && (
            <button
              type="button"
              className="no-print"
              aria-label={DELETE_PHOTO[level]}
              onClick={() => onDelete(photo.key)}
              style={{
                position: 'absolute',
                top: '0.25rem',
                right: '0.25rem',
                minWidth: '2rem',
                minHeight: '2rem',
                borderRadius: '999px',
              }}
            >
              ×
            </button>
          )}
        </figure>
      ))}
    </div>
  );
}
