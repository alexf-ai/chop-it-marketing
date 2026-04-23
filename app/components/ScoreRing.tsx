// ScoreRing — three concentric arcs. Outer: Plants (green). Middle: Fibre (amber). Inner: Protein (pink).
// Each arc fills clockwise from the top. Round linecap. Faint background track at 15% opacity.

import { BRAND, bandFor } from '@/app/lib/score';

type ArcProps = {
  radius: number;
  stroke: number;
  color: string;
  progress: number;
  rotation?: number;
};

function Arc({ radius, stroke, color, progress, rotation = -90 }: ArcProps) {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  return (
    <g transform={`rotate(${rotation} 100 100)`}>
      <circle cx={100} cy={100} r={radius} fill="none" stroke={color} strokeOpacity={0.15} strokeWidth={stroke} />
      <circle
        cx={100}
        cy={100}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.2,.7,.2,1)' }}
      />
    </g>
  );
}

type ScoreRingProps = {
  score?: number;
  protein?: number;
  fibre?: number;
  plants?: number;
  size?: number;
  showLabel?: boolean;
  compact?: boolean;
};

export default function ScoreRing({
  score = 74,
  protein,
  fibre,
  plants,
  size = 260,
  showLabel = false,
  compact = false,
}: ScoreRingProps) {
  // If individual pillar scores not given, derive a plausible set from the composite.
  const p = protein ?? Math.min(90, Math.max(20, score + 6));
  const f = fibre ?? Math.min(90, Math.max(20, score - 10));
  const pl = plants ?? Math.min(90, Math.max(20, score + 2));

  const stroke = compact ? 10 : 14;
  const gap = compact ? 4 : 6;
  const rOuter = 86;
  const rMid = rOuter - stroke - gap;
  const rInner = rMid - stroke - gap;

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <Arc radius={rOuter} stroke={stroke} color={BRAND.plants} progress={pl / 100} />
        <Arc radius={rMid} stroke={stroke} color={BRAND.fibre} progress={f / 100} />
        <Arc radius={rInner} stroke={stroke} color={BRAND.protein} progress={p / 100} />
      </svg>
      <div className="ring-center">
        <div className="ring-score">{Math.round(score)}</div>
        {showLabel && <div className="ring-band">{bandFor(score)}</div>}
      </div>
    </div>
  );
}
