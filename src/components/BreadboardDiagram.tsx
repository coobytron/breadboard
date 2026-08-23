import { holeToXY } from '../lib/breadboard';
import type { Hole, Placement } from '../types';

interface BreadboardDiagramProps {
  placements: Placement[];
  highlight?: Hole[];
}

const COLUMNS = 'ABCDEFGHIJ'.split('');
const ROWS = Array.from({ length: 30 }, (_, index) => index + 1);

function placementPoints(placement: Placement) {
  return placement.holes.flatMap((hole) => {
    const point = holeToXY(hole);
    return point ? [point] : [];
  });
}

function PlacementShape({ placement }: { placement: Placement }) {
  const points = placementPoints(placement);
  if (points.length === 0) return null;

  const first = points[0];
  const last = points[points.length - 1];
  const midX = (first.x + last.x) / 2;
  const midY = (first.y + last.y) / 2;
  const angle = Math.atan2(last.y - first.y, last.x - first.x) * 180 / Math.PI;

  if (placement.partId === 'jumper-wires' || placement.partId.includes('wire')) {
    return (
      <g>
        <line x1={first.x} y1={first.y} x2={last.x} y2={last.y} stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
        <circle cx={first.x} cy={first.y} r="5" fill="var(--accent)" />
        <circle cx={last.x} cy={last.y} r="5" fill="var(--accent)" />
      </g>
    );
  }

  if (placement.partId.startsWith('resistor-')) {
    return (
      <g transform={`translate(${midX} ${midY}) rotate(${angle})`}>
        <line x1={-30} y1="0" x2="30" y2="0" stroke="var(--text)" strokeWidth="3" />
        <rect x={-18} y={-8} width="36" height="16" rx="4" fill="#d7b77a" stroke="var(--text)" strokeWidth="2" />
        <line x1={-8} y1={-8} x2={-8} y2="8" stroke="#ef4444" strokeWidth="4" />
        <line x1="0" y1={-8} x2="0" y2="8" stroke="#111827" strokeWidth="4" />
        <line x1="8" y1={-8} x2="8" y2="8" stroke="#92400e" strokeWidth="4" />
        {placement.label && <text x="0" y={-14} textAnchor="middle" fill="var(--text)" fontSize="11">{placement.label}</text>}
      </g>
    );
  }

  if (placement.partId.startsWith('led-')) {
    return (
      <g>
        <line x1={first.x} y1={first.y} x2={last.x} y2={last.y} stroke="var(--text)" strokeWidth="3" />
        <circle cx={midX} cy={midY} r="11" fill="var(--danger)" stroke="var(--text)" strokeWidth="2" />
        <line x1={midX + 7} y1={midY - 8} x2={midX + 7} y2={midY + 8} stroke="var(--text)" strokeWidth="3" />
        {placement.label && <text x={midX} y={midY - 16} textAnchor="middle" fill="var(--text)" fontSize="11">{placement.label}</text>}
      </g>
    );
  }

  if (points.length === 2) {
    return (
      <g>
        <line x1={first.x} y1={first.y} x2={last.x} y2={last.y} stroke="var(--ok)" strokeWidth="5" strokeLinecap="round" />
        {placement.label && <text x={midX} y={midY - 10} textAnchor="middle" fill="var(--text)" fontSize="11">{placement.label}</text>}
      </g>
    );
  }

  return (
    <g>
      <polyline
        points={points.map((point) => `${point.x},${point.y}`).join(' ')}
        fill="none"
        stroke="var(--ok)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="5" fill="var(--ok)" />)}
      {placement.label && <text x={midX} y={midY - 10} textAnchor="middle" fill="var(--text)" fontSize="11">{placement.label}</text>}
    </g>
  );
}

export function BreadboardDiagram({ placements, highlight = [] }: BreadboardDiagramProps) {
  const highlighting = highlight.length > 0;

  return (
    <svg
      viewBox="0 0 400 750"
      width="100%"
      height="auto"
      role="img"
      aria-label="Breadboard placement diagram"
      style={{ display: 'block', maxHeight: '70vh' }}
    >
      <rect x="50" y="5" width="300" height="740" rx="18" fill="var(--surface-2)" stroke="var(--muted)" />

      <g opacity={highlighting ? 0.4 : 1}>
        <line x1="65" y1="20" x2="335" y2="20" stroke="#ef4444" strokeWidth="4" />
        <line x1="65" y1="42" x2="335" y2="42" stroke="#3b82f6" strokeWidth="4" />
        <line x1="65" y1="700" x2="335" y2="700" stroke="#ef4444" strokeWidth="4" />
        <line x1="65" y1="722" x2="335" y2="722" stroke="#3b82f6" strokeWidth="4" />
        <text x="56" y="24" fill="#ef4444" fontSize="12">+</text>
        <text x="56" y="46" fill="#3b82f6" fontSize="12">−</text>
        <text x="56" y="704" fill="#ef4444" fontSize="12">+</text>
        <text x="56" y="726" fill="#3b82f6" fontSize="12">−</text>

        <rect x="180" y="68" width="40" height="604" fill="var(--bg)" opacity="0.7" />

        {COLUMNS.map((column) => {
          const point = holeToXY(`${column}1`);
          if (!point) return null;
          return <text key={column} x={point.x} y="68" textAnchor="middle" fill="var(--muted)" fontSize="11">{column}</text>;
        })}

        {ROWS.map((row) => {
          const leftPoint = holeToXY(`A${row}`);
          if (!leftPoint) return null;
          return (
            <g key={row}>
              <text x="68" y={leftPoint.y + 4} textAnchor="middle" fill="var(--muted)" fontSize="9">{row}</text>
              {COLUMNS.map((column) => {
                const point = holeToXY(`${column}${row}`);
                if (!point) return null;
                return <circle key={column} cx={point.x} cy={point.y} r="3.2" fill="var(--bg)" stroke="var(--muted)" strokeWidth="1" />;
              })}
            </g>
          );
        })}

        {placements.map((placement, index) => <PlacementShape key={`${placement.partId}-${index}`} placement={placement} />)}
      </g>

      {highlight.map((hole) => {
        const point = holeToXY(hole);
        if (!point) return null;
        return (
          <circle
            key={hole}
            cx={point.x}
            cy={point.y}
            r="10"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="5"
          />
        );
      })}
    </svg>
  );
}
