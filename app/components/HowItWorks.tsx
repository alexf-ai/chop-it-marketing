import DishPlaceholder from './DishPlaceholder';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
          <div className="how-title">Plan your week</div>
          <div className="how-body">
            Drop recipes into your week. Portions scale. The score tracks how the week is shaping up as you go.
          </div>
          <div className="how-visual how-visual-plan">
            <div className="how-plan-grid">
              {DAYS.map((d, i) => (
                <div key={d} className={`how-plan-day ${i < 5 ? 'filled' : ''}`}>
                  <div className="mono how-plan-d">{d}</div>
                  {i < 5 && <div className="how-plan-chip" />}
                </div>
              ))}
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
