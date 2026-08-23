import type { Organic, ReadingLevel } from '../types';
import type { GuessStrength } from '../hooks/useReadings';

interface GuessFirstProps {
  organic: Organic;
  level: ReadingLevel;
  onGuess: (guess: GuessStrength) => void;
}

const guessLabels: Record<GuessStrength, Record<ReadingLevel, string>> = {
  strong: { explorer: 'Strong', builder: 'Strong', engineer: 'Strong' },
  medium: { explorer: 'Medium', builder: 'Medium', engineer: 'Medium' },
  weak: { explorer: 'Weak', builder: 'Weak', engineer: 'Weak' },
};

export function GuessFirst({ organic, level, onGuess }: GuessFirstProps) {
  return (
    <section className="card">
      <h3>{organic.emoji} {organic.name}</h3>
      <p>{organic.guessPrompt[level]}</p>
      <div className="levels" role="group" aria-label={organic.guessPrompt[level]}>
        {(['strong', 'medium', 'weak'] as GuessStrength[]).map((guess) => (
          <button
            key={guess}
            type="button"
            onClick={() => onGuess(guess)}
            style={{ minWidth: 'var(--tap)', minHeight: 'var(--tap)' }}
          >
            {guessLabels[guess][level]}
          </button>
        ))}
      </div>
    </section>
  );
}
