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

type HowItWorksProps = { browseThumbs?: ReactNode; pantryShowcase?: ReactNode };

export default function HowItWorks({ browseThumbs, pantryShowcase }: HowItWorksProps = {}) {
  const fallbackThumbs = (
    <>
      <div className="how-thumb">
        <DishPlaceholder label="Harissa butter beans" tone="amber" aspect="1 / 1" />
      </div>
      <div className="how-thumb">
        <DishPlaceholder label="Miso aubergine" tone="herb" aspect="1 / 1" />
      </div>
      <div className="how-thumb">
        <DishPlaceholder label="Cod & lentils" tone="smoke" aspect="1 / 1" />
      </div>
    </>
  );

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
          <div className="how-visual how-visual-browse">{browseThumbs ?? fallbackThumbs}</div>
        </div>

        {/* Step 02 */}
        <div className="how-step how-step-pantry">
          <div className="how-num mono">02</div>
          <div className="how-title">What&rsquo;s in your kitchen, what&rsquo;s for dinner</div>
          <div className="how-body">
            Tell Chop It what you have. We&rsquo;ll tell you what to cook with it tonight, this week, or
            before it goes off.
          </div>
          <div className="how-visual how-visual-pantry">{pantryShowcase}</div>
          <div className="how-pantry-hint mono">
            Tap any ingredient in the app to see what you can cook with it tonight.
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
