type FinalCTAProps = { accent: string };

export default function FinalCTA({ accent }: FinalCTAProps) {
  return (
    <section className="section final">
      <div className="final-inner">
        <h2 className="h-editorial final-h">
          Weekly shop, <em>sorted in minutes.</em>
        </h2>
        <p className="final-sub">Free to start. No card. Works on the web today, on iPhone soon.</p>
        <div className="cta-row">
          <a className="btn btn-primary" style={{ background: accent }} href="#">
            Get Chop It free
          </a>
          <a className="btn btn-ghost" href="#">
            Try the web app →
          </a>
        </div>
        <div className="store-row">
          <div className="store-badge">
            <div className="store-badge-top mono">COMING SOON</div>
            <div className="store-badge-bot">App Store</div>
          </div>
          <div className="store-badge">
            <div className="store-badge-top mono">COMING SOON</div>
            <div className="store-badge-bot">Google Play</div>
          </div>
        </div>
      </div>
    </section>
  );
}
