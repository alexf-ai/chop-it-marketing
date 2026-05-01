'use client';

import ScoreRing from './ScoreRing';
import { bandFor, coachingFor } from '@/app/lib/score';

type ScoreExplainerProps = {
  score: number;
  setScore: (n: number) => void;
  accent: string;
};

const PILLARS = [
  {
    key: 'plants',
    name: 'Plants',
    color: '#6DC56E',
    body:
      'Aim for 30 different plants in a week. Onion, garlic, tomato, spinach, an apple — it adds up faster than you think.',
  },
  {
    key: 'fibre',
    name: 'Fibre',
    color: '#F5A623',
    body:
      'From vegetables, legumes, oats, nuts, seeds, fruit and wholegrains. Variety and quantity both matter — most people fall short on both.',
  },
  {
    key: 'protein',
    name: 'Protein',
    color: '#E8547A',
    body:
      'A clear protein per dinner. Chicken, fish, eggs, beans, tofu — anchoring each meal makes the whole week feel sturdier.',
  },
] as const;

export default function ScoreExplainer({ score, setScore, accent }: ScoreExplainerProps) {
  return (
    <section className="section score-x" id="score">
      <div className="score-x-grid">
        <div className="score-x-left">
          <div className="kicker mono">— THE WEEKLY DIVERSITY SCORE</div>
          <h2 className="h-editorial">
            Your week, <em>scored.</em>
          </h2>
          <p className="lead">
            A single number that reads your plan and tells you where the gaps are. Not a diet. Not homework.
            Just a nudge toward more varied, plant-forward cooking — without giving up the lasagne.
          </p>

          <div className="score-x-band-row">
            <div className="score-x-band-item">
              <span className="mono">0–44</span>
              <span>Needs work</span>
            </div>
            <div className="score-x-band-item">
              <span className="mono">45–62</span>
              <span>Decent</span>
            </div>
            <div className="score-x-band-item">
              <span className="mono">63–75</span>
              <span>Good</span>
            </div>
            <div className="score-x-band-item">
              <span className="mono">76–90</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="score-x-slider">
            <div className="score-x-slider-label">
              <span className="mono">DRAG TO EXPLORE →</span>
              <span className="score-x-slider-val">
                <span className="mono">{score}</span>
                <span className="score-x-slider-band"> · {bandFor(score)}</span>
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value, 10))}
              style={{ accentColor: accent }}
              aria-label="Explore score"
            />
            <div className="score-x-coach">{coachingFor(score)}</div>
          </div>

          <div className="score-x-disclaimer">
            Your Weekly Diversity Score is a guide to nutritional variety, not medical advice.
          </div>
        </div>

        <div className="score-x-right">
          <div className="score-x-ring-wrap">
            <ScoreRing score={score} size={380} />
          </div>
          <div className="score-x-pillars">
            {PILLARS.map((p) => (
              <div key={p.key} className="score-x-pillar">
                <div className="score-x-pillar-head">
                  <span className="score-x-dot" style={{ background: p.color }} />
                  <span className="score-x-pillar-name">{p.name}</span>
                </div>
                <div className="score-x-pillar-body">{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
