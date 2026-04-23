'use client';

import { ACCENTS, type AccentKey, bandFor } from '@/app/lib/score';

export type TweakState = {
  score: number;
  accent: AccentKey;
  showTeam: boolean;
};

type TweaksProps = {
  state: TweakState;
  setState: (next: TweakState) => void;
  onClose: () => void;
};

export default function Tweaks({ state, setState, onClose }: TweaksProps) {
  return (
    <aside className="tweaks">
      <div className="tweaks-h">
        <div className="tweaks-title">Tweaks</div>
        <button className="tweaks-close" onClick={onClose} aria-label="Close tweaks">
          ×
        </button>
      </div>
      <div className="tweak-row">
        <div className="tweak-label">
          <span>SCORE</span>
          <span className="val">
            {state.score} · {bandFor(state.score)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          value={state.score}
          onChange={(e) => setState({ ...state, score: parseInt(e.target.value, 10) })}
        />
      </div>
      <div className="tweak-row">
        <div className="tweak-label">
          <span>ACCENT</span>
          <span className="val">{state.accent}</span>
        </div>
        <div className="tweak-swatches">
          {(Object.entries(ACCENTS) as Array<[AccentKey, string]>).map(([k, v]) => (
            <button
              key={k}
              className={`tweak-swatch ${state.accent === k ? 'on' : ''}`}
              style={{ background: v }}
              onClick={() => setState({ ...state, accent: k })}
              title={k}
              aria-label={`Accent ${k}`}
            />
          ))}
        </div>
      </div>
      <div className="tweak-row">
        <div className="tweak-label">
          <span>TEAM QUOTES</span>
          <span className="val">{state.showTeam ? 'shown' : 'hidden'}</span>
        </div>
        <button
          className="btn btn-ghost btn-tiny"
          style={{ width: '100%' }}
          onClick={() => setState({ ...state, showTeam: !state.showTeam })}
        >
          {state.showTeam ? 'Hide' : 'Show'}
        </button>
      </div>
    </aside>
  );
}
