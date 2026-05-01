import PhoneMock, { type PhoneMeal } from './PhoneMock';

type HeroProps = {
  score: number;
  accent: string;
  phoneMeals?: PhoneMeal[];
};

export default function Hero({ score, accent, phoneMeals }: HeroProps) {
  return (
    <header className="hero">
      <div className="hero-grid">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="pulse" />
            <span className="mono">NEW · WEEKLY DIVERSITY SCORE</span>
          </div>
          <h1 className="hero-h">
            <span className="hero-h-line">Weekly shop,</span>
            <span className="hero-h-line">
              <em>sorted</em> in minutes.
            </span>
          </h1>
          <p className="hero-sub">
            Chop It plans your week, writes the shop, and quietly coaches you toward more varied,
            plant-forward eating — without giving up the meals you love.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary" style={{ background: accent }} href="#">
              Try the web app
            </a>
            <a className="btn btn-ghost" href="#">
              See how it works →
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-k mono">TARGET PLANTS / WK</div>
              <div className="hero-stat-v">
                30<span className="dot">.</span>
              </div>
            </div>
            <div>
              <div className="hero-stat-k mono">PANS ON THE HOB</div>
              <div className="hero-stat-v">
                2<span className="dot">.</span>
              </div>
            </div>
            <div>
              <div className="hero-stat-k mono">ACTIVE TIME</div>
              <div className="hero-stat-v">
                &lt;30m<span className="dot">.</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <PhoneMock score={score} meals={phoneMeals} />
        </div>
      </div>
    </header>
  );
}
