import DishPlaceholder from './DishPlaceholder';

type RingSpec = { color: string; radius: number; pct: number };

const RINGS: RingSpec[] = [
  { color: '#E8547A', radius: 68, pct: 0.42 }, // Protein (outer)
  { color: '#F5A623', radius: 52, pct: 0.66 }, // Fibre (middle)
  { color: '#6DC56E', radius: 36, pct: 0.82 }, // Plants (inner)
];

function DiversityRings() {
  const size = 180;
  const center = size / 2;
  const strokeWidth = 10;
  return (
    <svg
      className="how-score-rings"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
    >
      {RINGS.map(({ color, radius, pct }) => {
        const circumference = 2 * Math.PI * radius;
        const dash = circumference * pct;
        return (
          <g key={radius} transform={`rotate(-90 ${center} ${center})`}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeOpacity={0.15}
              strokeWidth={strokeWidth}
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </g>
        );
      })}
    </svg>
  );
}

type ShopItem = { n: string; q: string; got?: boolean; pantry?: boolean };

const SHOP: ShopItem[] = [
  { n: 'Butter beans', q: '2 tins', got: true },
  { n: 'Tenderstem broccoli', q: '200g', got: true },
  { n: 'Tahini', q: '1 jar', pantry: true },
  { n: 'Salmon fillets', q: '2', got: false },
  { n: 'Lemons', q: '3', got: false },
];

export default function HowItWorks() {
  return (
    <section className="section how">
      <div className="section-head">
        <div className="kicker mono">— HOW IT WORKS</div>
        <h2 className="h-editorial">
          Three steps. <span className="muted">Weekly shop, sorted in minutes.</span>
        </h2>
      </div>
      <div className="how-steps">
        {/* Step 01 */}
        <div className="how-step">
          <div className="how-num mono">01</div>
          <div className="how-title">Browse or generate recipes</div>
          <div className="how-body">
            Pull from our library. Snap a cookbook. Or ask for fifty BBQ ideas and pick your favourites.
          </div>
          <div className="how-visual how-visual-browse">
            <div className="how-thumb">
              <DishPlaceholder label="Harissa butter beans" tone="amber" aspect="1 / 1" />
            </div>
            <div className="how-thumb">
              <DishPlaceholder label="Miso aubergine" tone="herb" aspect="1 / 1" />
            </div>
            <div className="how-thumb">
              <DishPlaceholder label="Cod & lentils" tone="smoke" aspect="1 / 1" />
            </div>
          </div>
        </div>

        {/* Step 02 */}
        <div className="how-step">
          <div className="how-num mono">02</div>
          <div className="how-title">Track your diversity</div>
          <div className="how-body">
            See your weekly diversity score — protein, fibre and plants rated
            out of 100. Aim high. Eat well.
          </div>
          <div className="how-visual how-visual-score">
            <DiversityRings />
            <div className="how-score-legend">
              <div className="how-score-legend-item">
                <span className="how-score-dot" style={{ background: '#E8547A' }} />
                <span>Protein</span>
              </div>
              <div className="how-score-legend-item">
                <span className="how-score-dot" style={{ background: '#F5A623' }} />
                <span>Fibre</span>
              </div>
              <div className="how-score-legend-item">
                <span className="how-score-dot" style={{ background: '#6DC56E' }} />
                <span>Plants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 03 */}
        <div className="how-step">
          <div className="how-num mono">03</div>
          <div className="how-title">Shop with a smart list</div>
          <div className="how-body">
            One list, aisle-sorted, pantry-aware. Tick as you go. The kind of list you actually use.
          </div>
          <div className="how-visual how-visual-shop">
            {SHOP.map((it, i) => (
              <div
                key={i}
                className={`how-shop-row ${it.got ? 'got' : ''} ${it.pantry ? 'pantry' : ''}`}
              >
                <span className={`check ${it.got ? 'on' : ''}`} />
                <span className="how-shop-n">{it.n}</span>
                <span className="how-shop-q mono">{it.q}</span>
                {it.pantry && <span className="how-shop-flag mono">IN PANTRY</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
