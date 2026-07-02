import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { recipes } from '../../lib/mockData';

export default function RecipeDetailPage({ params }) {
  const recipe = recipes.find((item) => item.id === params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="page-shell detail-page">
      <Link href="/recipes" className="text-link">← Back to recipes</Link>
      <section className="detail-layout">
        <div>
          <Image src={recipe.image} alt={recipe.name} width={800} height={520} className="detail-image" />
        </div>
        <div className="detail-card">
          <p className="eyebrow">Recipe details</p>
          <h1>{recipe.name}</h1>
          <p className="lead">{recipe.description}</p>
          <div className="detail-meta">
            <span>Category: {recipe.category}</span>
            <span>Cuisine: {recipe.cuisine}</span>
            <span>Time: {recipe.time} min</span>
            <span>Difficulty: {recipe.difficulty}</span>
            <span>Likes: {recipe.likes}</span>
            <span>Price: ${recipe.price}</span>
          </div>
          <div className="action-row">
            <button className="button">Purchase</button>
            <button className="button-outline">Like</button>
            <button className="button-outline">Report</button>
            <button className="button-outline">Favorite</button>
          </div>
          <div className="detail-block">
            <h3>Ingredients</h3>
            <ul>
              {recipe.ingredients.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="detail-block">
            <h3>Instructions</h3>
            <p>{recipe.instructions}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
