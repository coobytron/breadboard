import { parts } from '../content';
import { useInventory } from '../hooks/useInventory';
import type { LeveledText, Part, PartCategory, ReadingLevel } from '../types';

interface InventoryPickerProps {
  level: ReadingLevel;
}

const categoryLabels: Record<PartCategory, LeveledText> = {
  power: { explorer: 'Power', builder: 'Power', engineer: 'Power' },
  output: { explorer: 'Lights', builder: 'Lights and sounds', engineer: 'Output' },
  input: { explorer: 'Buttons', builder: 'Buttons and switches', engineer: 'Input' },
  active: { explorer: 'Tiny helpers', builder: 'Transistors', engineer: 'Active' },
  passive: { explorer: 'Little helpers', builder: 'Resistors and capacitors', engineer: 'Passive' },
  wiring: { explorer: 'Wires', builder: 'Wires and board', engineer: 'Wiring' },
  organic: { explorer: 'Squishy things', builder: 'Fruit and squishy things', engineer: 'Organic' },
  tool: { explorer: 'Tools', builder: 'Tools', engineer: 'Tools' },
};

const categories: PartCategory[] = [
  'power',
  'output',
  'input',
  'active',
  'passive',
  'wiring',
  'organic',
  'tool',
];

function quantityActionLabel(part: Part, action: 'add' | 'remove'): LeveledText {
  const verb = action === 'add' ? 'Add' : 'Remove';
  return {
    explorer: `${verb} one ${part.name}`,
    builder: `${verb} one ${part.name}`,
    engineer: `${verb} one ${part.name}`,
  };
}

export function InventoryPicker({ level }: InventoryPickerProps) {
  const { inventory, setQuantity } = useInventory();

  const quantityFor = (partId: string) => inventory.find((item) => item.partId === partId)?.quantity ?? 0;

  return (
    <div>
      {categories.map((category) => {
        const categoryParts = parts.filter((part) => part.category === category);
        if (categoryParts.length === 0) return null;

        return (
          <section key={category} aria-labelledby={`inventory-${category}`}>
            <h2 id={`inventory-${category}`} className="track">
              {categoryLabels[category][level]}
            </h2>
            {categoryParts.map((part) => {
              const quantity = quantityFor(part.id);
              return (
                <article className="card" key={part.id}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span aria-hidden="true" style={{ fontSize: '1.75rem' }}>{part.icon}</span>
                    <div style={{ flex: 1 }}>
                      <h3>{part.name}</h3>
                      <p>{part.blurb[level]}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        aria-label={quantityActionLabel(part, 'remove')[level]}
                        onClick={() => setQuantity(part.id, Math.max(0, quantity - 1))}
                        disabled={quantity === 0}
                        style={{ minWidth: 'var(--tap)', minHeight: 'var(--tap)' }}
                      >
                        −
                      </button>
                      <output aria-live="polite" style={{ minWidth: '2ch', textAlign: 'center' }}>{quantity}</output>
                      <button
                        type="button"
                        aria-label={quantityActionLabel(part, 'add')[level]}
                        onClick={() => setQuantity(part.id, quantity + 1)}
                        style={{ minWidth: 'var(--tap)', minHeight: 'var(--tap)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
