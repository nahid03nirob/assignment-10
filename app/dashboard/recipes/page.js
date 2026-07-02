import Link from 'next/link';
import { recipes } from '../../lib/mockData';

export default function MyRecipesPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">My recipes</p>
          <h1>Your published recipes</h1>
          <p className="lead">Manage the dishes you created and keep your collection up to date.</p>
        </div>
      </header>
      <section className="card-grid">
        {recipes.slice(0, 3).map((recipe) => (
          <article key={recipe.id} className="card">
            <div className="card-body">
              <h3>{recipe.name}</h3>
              <p>{recipe.description}</p>
              <div className="action-row">
                <button className="button-outline">Edit</button>
                <button className="button-outline">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
