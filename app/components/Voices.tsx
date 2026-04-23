type Quote = { q: string; by: string; role: string };

const QUOTES: Quote[] = [
  {
    q: 'The lasagne is not the enemy. Balance the rest of the week around it and the numbers look after themselves.',
    by: 'Neve Harper, RNutr',
    role: 'Head of Nutrition',
  },
  {
    q: 'Two pans. One board. A finishing touch that makes you feel like you put the effort in.',
    by: 'Chef Marco Bellini',
    role: 'Head of Culinary',
  },
  {
    q: 'Real food, cooked in a real kitchen, shot in the light you actually have at seven in the evening.',
    by: 'Isla Rowe',
    role: 'Creative Director',
  },
];

export default function Voices() {
  return (
    <section className="section voices">
      <div className="section-head">
        <div className="kicker mono">— FROM THE KITCHEN</div>
        <h2 className="h-editorial">Built by people who cook.</h2>
      </div>
      <div className="voices-grid">
        {QUOTES.map((q, i) => (
          <blockquote key={i} className="voice-card">
            <div className="voice-mark">&ldquo;</div>
            <div className="voice-q">{q.q}</div>
            <div className="voice-by">
              <div className="voice-name">{q.by}</div>
              <div className="voice-role mono">{q.role}</div>
            </div>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
