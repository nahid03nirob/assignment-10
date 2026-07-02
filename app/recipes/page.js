import Link from 'next/link';
import Image from 'next/image';
import { recipes } from '../lib/mockData';

export default function BrowseRecipesPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Browse recipes</p>
          <h1>Find your next favorite dish.</h1>
          <p className="lead">Explore a curated collection of recipes with filtering, cards, and quick details.</p>
        </div>
      </header>

      <section className="filter-bar">
        <div className="field">
          <label>Category</label>
          <select defaultValue="All">
            <option>All</option>
            <option>Dinner</option>
            <option>Lunch</option>
            <option>Snacks</option>
            <option>Dessert</option>
          </select>
        </div>
        <div className="field">
          <label>Cuisine</label>
          <select defaultValue="All">
            <option>All</option>
            <option>Bangladeshi</option>
            <option>Italian</option>
            <option>Mexican</option>
            <option>Thai</option>
          </select>
        </div>
      </section>

      <section className="card-grid recipes-grid">
        {recipes.slice(0, 4).map((recipe) => (
          <article key={recipe.id} className="card">
            <Image src={recipe.image} alt={recipe.name} width={600} height={320} className="card-image" />
            <div className="card-body">
              <span className="pill">{recipe.category}</span>
              <h3>{recipe.name}</h3>
              <p>{recipe.description}</p>
              <div className="card-meta">
                <span>{recipe.cuisine}</span>
                <span>{recipe.time} min</span>
              </div>
              <Link href={`/recipes/${recipe.id}`} className="button-outline" style={{ marginTop: '12px', display: 'inline-flex' }}>
                View Details
              </Link>
            </div>
          </article>
        ))}
      </section>

      <div className="pagination" aria-label="Recipe pagination">
        <button className="active" type="button">1</button>
        <button type="button">2</button>
        <button type="button">3</button>
      </div>
    </main>
  );
}
