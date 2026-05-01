// ScoreRing — minimal neutral ring. Single arc, white at 90%, with a small
// pink position-indicator dot at the end of the fill. Pink discipline:
// pink only appears on CTAs and this dot on the homepage.

import { bandFor } from '@/app/lib/score';

const TRACK_COLOR = '#2a2a2e';
const FILL_COLOR = 'rgba(255, 255, 255, 0.9)';
const DOT_COLOR = '#bd4d76';

type ScoreRingProps = {
  score?: number;
  size?: number;
  showLabel?: boolean;
  compact?: boolean;
};

export default function ScoreRing({
  score = 78,
  size = 260,
  showLabel = false,
  compact = false,
}: ScoreRingProps) {
  // Score is 0-90 in the brand spec; arc fills proportionally over a full circle.
  const safeScore = Math.max(0, Math.min(90, score));
  const progress = safeScore / 90;

  const stroke = compact ? 10 : 14;
  const dotR = compact ? 5 : 7;
  const cx = 100;
  const cy = 100;
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  // Position the dot at the leading edge of the arc. Arc starts at 12 o'clock
  // (-90deg) and grows clockwise; angle in radians for trig.
  const angle = (-90 + progress * 360) * (Math.PI / 180);
  const dotX = cx + radius * Math.cos(angle);
  const dotY = cy + radius * Math.sin(angle);

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={TRACK_COLOR} strokeWidth={stroke} />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={FILL_COLOR}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.2,.7,.2,1)' }}
          />
        </g>
        {progress > 0.01 && (
          <circle cx={dotX} cy={dotY} r={dotR} fill={DOT_COLOR} />
        )}
      </svg>
      <div className="ring-center">
        <div className="ring-score">{Math.round(score)}</div>
        {showLabel && <div className="ring-band">{bandFor(score)}</div>}
      </div>
    </div>
  );
}
