import DishPlaceholder from './DishPlaceholder';

type Recipe = {
  name: string;
  time: string;
  tone: 'warm' | 'herb' | 'berry' | 'amber' | 'smoke';
  tags: string[];
};

const RECIPES: Recipe[] = [
  { name: 'Harissa butter beans, whipped feta, crispy shallots', time: '25 min', tone: 'amber', tags: ['Veg', 'Quick'] },
  { name: 'Miso-glazed aubergine, sesame greens, jasmine rice', time: '30 min', tone: 'herb', tags: ['Veg'] },
  { name: 'Lemon chicken orzo, charred courgette, dill', time: '28 min', tone: 'warm', tags: ['Family'] },
  { name: 'Smoky black bean tacos, pickled onion slaw', time: '22 min', tone: 'berry', tags: ['Veg', 'Quick'] },
  { name: 'Crispy gnocchi, brown butter sage, walnuts', time: '20 min', tone: 'amber', tags: ['Quick'] },
  { name: 'Cod with lentils, salsa verde, blistered tomatoes', time: '32 min', tone: 'smoke', tags: ['Fish'] },
];

export default function FeaturedRecipes() {
  return (
    <section className="section recipes">
      <div className="section-head">
        <div className="kicker mono">— FEATURED THIS WEEK</div>
        <h2 className="h-editorial">
          Cook tonight. <span className="muted">Or park it for Thursday.</span>
        </h2>
      </div>
      <div className="recipes-grid">
        {RECIPES.map((r, i) => (
          <a key={i} className="recipe-card" href="#">
            <DishPlaceholder label={r.name} tone={r.tone} aspect="4 / 5" />
            <div className="recipe-meta">
              <div className="recipe-tags">
                {r.tags.map((t) => (
                  <span key={t} className="tag mono">
                    {t}
                  </span>
                ))}
                <span className="tag-time mono">{r.time}</span>
              </div>
              <div className="recipe-name">{r.name}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
