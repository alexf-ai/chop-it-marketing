// Block 07 — Built on three ideas. Replaces the deleted persona testimonials.
// Editorial principles do the same job ("we know what we're talking about")
// without putting words in invented mouths.

type Principle = { title: string; body: string };

const PRINCIPLES: Principle[] = [
  {
    title: 'Variety beats restriction.',
    body:
      'Thirty different plants a week does more for your gut than cutting out one food group ever will. Onion, garlic, an apple, a handful of seeds — it adds up.',
  },
  {
    title: 'Comfort food stays.',
    body:
      'Smash burgers, mac and cheese, fish fingers, Friday lasagne. They’re features, not bugs. The week balances around them.',
  },
  {
    title: 'Hidden uplift, not hidden lectures.',
    body:
      'Lentils into the bolognese. Squash purée into the mac sauce. Same dinner you wanted, quietly more fibre and one extra plant. We don’t tell, you don’t notice, the numbers move.',
  },
];

export default function Principles() {
  return (
    <section className="section principles">
      <div className="section-head">
        <div className="kicker mono">— OUR APPROACH</div>
        <h2 className="h-editorial">Built on three ideas.</h2>
      </div>
      <div className="principles-grid">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="principle-card">
            <h3 className="principle-title">{p.title}</h3>
            <p className="principle-body">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
