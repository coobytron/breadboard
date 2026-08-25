import { useRef, useState, type ChangeEvent } from 'react';
import { savePhoto } from '../lib/photo-store';
import type { LeveledText, ReadingLevel } from '../types';

interface PhotoCaptureProps {
  onSaved: (key: string) => void;
  level?: ReadingLevel;
}

const ADD_PHOTO: LeveledText = {
  explorer: 'Take a picture',
  builder: 'Add a photo',
  engineer: 'Attach build photo',
};

const SAVING_PHOTO: LeveledText = {
  explorer: 'Saving picture…',
  builder: 'Saving photo…',
  engineer: 'Downscaling and saving photo…',
};

const PHOTO_ERROR: LeveledText = {
  explorer: 'That picture did not save. Ask a grown-up to try again.',
  builder: 'That photo could not be saved on this device. Try again.',
  engineer: 'Photo storage is unavailable or full on this device. Nothing was uploaded.',
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The selected image could not be opened.'));
    image.src = url;
  });
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('The selected image could not be converted to JPEG.'));
      },
      'image/jpeg',
      0.8,
    );
  });
}

async function downscalePhoto(file: File): Promise<Blob> {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(sourceUrl);
    const longEdge = Math.max(image.naturalWidth, image.naturalHeight);
    if (longEdge <= 0) throw new Error('The selected image has no usable dimensions.');

    const scale = Math.min(1, 1280 / longEdge);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image resizing is unavailable in this browser.');

    context.drawImage(image, 0, 0, width, height);
    return canvasToJpeg(canvas);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function PhotoCapture({ onSaved, level = 'builder' }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setError(null);

    try {
      const blob = await downscalePhoto(file);
      const key = await savePhoto(blob);
      onSaved(key);
    } catch {
      setError(PHOTO_ERROR[level]);
    } finally {
      setSaving(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="no-print" style={{ marginTop: '0.75rem' }}>
      <label
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: 'var(--tap)',
          padding: '0.5rem 0.75rem',
          border: '1px solid currentColor',
          borderRadius: '0.5rem',
          cursor: saving ? 'wait' : 'pointer',
        }}
      >
        <span>{saving ? SAVING_PHOTO[level] : ADD_PHOTO[level]}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={saving}
          onChange={(event: ChangeEvent<HTMLInputElement>) => void handleChange(event)}
          style={{
            position: 'absolute',
            inlineSize: '1px',
            blockSize: '1px',
            overflow: 'hidden',
            clip: 'rect(0 0 0 0)',
            whiteSpace: 'nowrap',
          }}
        />
      </label>
      {error && <p role="alert" className="sub">{error}</p>}
    </div>
  );
}
