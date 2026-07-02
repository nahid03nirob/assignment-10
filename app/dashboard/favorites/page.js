import Link from 'next/link';
import { recipes } from '../../lib/mockData';

export default function FavoritesPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Favorites</p>
          <h1>Your saved recipes</h1>
          <p className="lead">Keep bookmarking recipes you want to try later.</p>
        </div>
      </header>
      <section className="card-grid">
        {recipes.slice(0, 2).map((recipe) => (
          <article key={recipe.id} className="card">
            <div className="card-body">
              <h3>{recipe.name}</h3>
              <p>{recipe.description}</p>
              <div className="action-row">
                <Link href={`/recipes/${recipe.id}`} className="button-outline">View Details</Link>
                <button className="button-outline">Remove</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
