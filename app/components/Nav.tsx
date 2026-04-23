type NavProps = { accent: string };

export default function Nav({ accent }: NavProps) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#" className="wordmark">
          Chop&nbsp;It
        </a>
        <div className="nav-links">
          <a href="#score">Diversity Score</a>
          <a href="#recipes">Recipes</a>
          <a href="#how">How it works</a>
          <a href="#">Feasts</a>
        </div>
        <div className="nav-cta">
          <a className="btn btn-ghost btn-tiny" href="#">
            Sign in
          </a>
          <a className="btn btn-primary btn-tiny" style={{ background: accent }} href="#">
            Get the app
          </a>
        </div>
      </div>
    </nav>
  );
}
