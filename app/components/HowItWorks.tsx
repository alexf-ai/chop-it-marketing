import type { ReactNode } from 'react';

import DishPlaceholder from './DishPlaceholder';

type ShopItem = { n: string; q: string; got?: boolean; pantry?: boolean };

const SHOP: ShopItem[] = [
  { n: 'Butter beans', q: '2 tins', got: true },
  { n: 'Tenderstem broccoli', q: '200g', got: true },
  { n: 'Tahini', q: '1 jar', pantry: true },
  { n: 'Salmon fillets', q: '2', got: false },
  { n: 'Lemons', q: '3', got: false },
];

type CookRow = { day: string; name: string; ticked: boolean; tone: 'amber' | 'herb' | 'warm' };

const COOK: CookRow[] = [
  { day: 'Mon', name: 'Crispy gnocchi, brown butter sage', ticked: true, tone: 'amber' },
  { day: 'Tue', name: 'Charred broccoli, tahini, butter beans', ticked: true, tone: 'herb' },
  { day: 'Wed', name: 'Miso-glazed salmon, soba', ticked: false, tone: 'warm' },
];

type HowItWorksProps = { browseThumbs?: ReactNode };

export default function HowItWorks({ browseThumbs }: HowItWorksProps = {}) {
  const fallbackThumbs = (
    <div className="how-visual-browse">
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
  );

  return (
    <section className="section how" id="how">
      <div className="section-head">
        <div className="kicker mono">— HOW IT WORKS</div>
        <h2 className="h-editorial">
          Three steps. <span className="muted">Weekly shop, sorted in minutes.</span>
        </h2>
      </div>
      <div className="how-steps">
        {/* Step 01 — Browse or generate */}
        <div className="how-step">
          <div className="how-num mono">01</div>
          <div className="how-title">Browse or generate recipes</div>
          <div className="how-body">
            Pull from our library. Snap a cookbook. Or ask for fifty BBQ ideas and pick your favourites.
          </div>
          <div className="how-visual">{browseThumbs ?? fallbackThumbs}</div>
        </div>

        {/* Step 02 — One smart shop */}
        <div className="how-step">
          <div className="how-num mono">02</div>
          <div className="how-title">One smart shop</div>
          <div className="how-body">
            Ingredients aggregated, pantry-aware, sorted by aisle. No double buying the coriander.
            Whisk handoff to your supermarket of choice.
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

        {/* Step 03 — Cook, score, repeat */}
        <div className="how-step">
          <div className="how-num mono">03</div>
          <div className="how-title">Cook, score, repeat</div>
          <div className="how-body">
            Tick meals off as you cook them. Your Weekly Diversity Score updates as you go.
            Saturday’s brunch counts as much as Tuesday’s stir-fry.
          </div>
          <div className="how-visual how-visual-cook">
            {COOK.map((c, i) => (
              <div key={i} className={`how-cook-row ${c.ticked ? 'ticked' : ''}`}>
                <span className={`check ${c.ticked ? 'on' : ''}`} />
                <span className="how-cook-day mono">{c.day}</span>
                <span className="how-cook-name">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
