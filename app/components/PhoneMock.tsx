// A styled iPhone-ish screen mock for the hero. Not a real device frame — a stylized
// representation of the app chrome showing the This Week view with the Score Ring.

import ScoreRing from './ScoreRing';
import DishPlaceholder from './DishPlaceholder';
import { bandFor, coachingFor } from '@/app/lib/score';

type Day = { d: string; meal: string; tone: 'warm' | 'herb' | 'berry' | 'amber' | 'smoke' };

const DAYS: Day[] = [
  { d: 'Mon', meal: 'Crispy gnocchi, brown butter sage', tone: 'amber' },
  { d: 'Tue', meal: 'Charred broccoli, tahini, butter beans', tone: 'herb' },
  { d: 'Wed', meal: 'Miso-glazed salmon, soba', tone: 'warm' },
];

export default function PhoneMock({ score = 74 }: { score?: number }) {
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="phone-status">
          <span className="mono">9:41</span>
          <span className="phone-status-right">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </span>
        </div>

        <div className="phone-tabs">
          <span className="tab on">This Week</span>
          <span className="tab">Shop</span>
          <span className="tab">Pantry</span>
        </div>

        <div className="phone-hello">
          <div className="phone-kicker mono">WEEK OF 21 APR</div>
          <div className="phone-title">Your week, sorted.</div>
        </div>

        <div className="phone-score-card">
          <ScoreRing score={score} size={156} compact />
          <div className="phone-score-side">
            <div className="phone-score-kicker mono">WEEKLY DIVERSITY</div>
            <div className="phone-score-band">{bandFor(score)}</div>
            <div className="phone-score-coach">{coachingFor(score)}</div>
            <div className="phone-pillars">
              <span className="pill pill-plants">Plants</span>
              <span className="pill pill-fibre">Fibre</span>
              <span className="pill pill-protein">Protein</span>
            </div>
          </div>
        </div>

        <div className="phone-meals-head">
          <span className="mono">THIS WEEK&rsquo;S MEALS</span>
          <span className="phone-meals-more">5 of 7</span>
        </div>

        <div className="phone-meals">
          {DAYS.map((dy, i) => (
            <div key={i} className="phone-meal">
              <DishPlaceholder label={dy.meal} tone={dy.tone} aspect="1 / 1" />
              <div className="phone-meal-body">
                <div className="phone-meal-day mono">{dy.d}</div>
                <div className="phone-meal-name">{dy.meal}</div>
              </div>
              <div className="phone-meal-chev">&rsaquo;</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
