import Link from 'next/link';
import { recipes } from '../../lib/mockData';

export default function PurchasesPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Purchased recipes</p>
          <h1>Your purchased cookbook items</h1>
          <p className="lead">Access recipes you bought for premium content and detailed instructions.</p>
        </div>
      </header>
      <section className="card-grid">
        {recipes.slice(0, 2).map((recipe) => (
          <article key={recipe.id} className="card">
            <div className="card-body">
              <h3>{recipe.name}</h3>
              <p>{recipe.description}</p>
              <Link href={`/recipes/${recipe.id}`} className="button-outline" style={{ display: 'inline-flex', marginTop: '10px' }}>
                View Details
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
