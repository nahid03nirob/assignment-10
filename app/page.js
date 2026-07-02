import Image from 'next/image';
import heroImage from '../Image/BG/1.jpg';
import recipeOne from '../Image/Recipe/1.jpg';
import recipeTwo from '../Image/Recipe/2.jpg';
import recipeThree from '../Image/Recipe/3.jpg';
import chefImage from '../Image/chef/4.jpg';
import foodImage from '../Image/food/16.jpg';
import AnimatedSection from './components/AnimatedSection';

const featuredRecipes = [
  {
    title: 'Smoky Chicken Biryani',
    category: 'Dinner',
    time: '75 min',
    image: recipeOne,
    description: 'Fragrant layers of rice, spices, and tender chicken for a memorable dinner.'
  },
  {
    title: 'Creamy Garlic Pasta',
    category: 'Lunch',
    time: '28 min',
    image: recipeTwo,
    description: 'A quick, comforting pasta with a silky garlic cream finish.'
  },
  {
    title: 'Crispy Veggie Tacos',
    category: 'Snacks',
    time: '35 min',
    image: recipeThree,
    description: 'Bright, crunchy, and packed with flavor for fresh weeknight bites.'
  }
];

const highlights = [
  'Create and publish recipes with rich details.',
  'Discover favorites, save recipes, and build a personal collection.',
  'Manage profile, premium features, and community reports in one dashboard.'
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <AnimatedSection>
        <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Next.js recipe platform</p>
          <h1>Share, discover, and cook with confidence.</h1>
          <p className="lead">
            RecipeHub brings your favorite recipes, cooking inspiration, and premium creator tools together in a polished experience designed for modern web apps.
          </p>
          <div className="hero-actions">
            <a className="button" href="#featured">Explore Recipes</a>
            <a className="button-outline" href="#about">Why RecipeHub</a>
          </div>
        </div>
        <div className="hero-media">
          <Image src={heroImage} alt="Freshly prepared dishes on a dining table" fill priority className="hero-image" />
          <div className="hero-card">
            <span className="pill">Community favorite</span>
            <h3>100+ curated recipes ready to try</h3>
            <p>Built for fast browsing, personal collections, and a beautiful recipe-first experience.</p>
          </div>
        </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
      <section id="featured" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Featured picks</p>
            <h2>Popular recipes this week</h2>
          </div>
          <a href="#discover" className="text-link">Browse all recipes</a>
        </div>
        <div className="card-grid">
          {featuredRecipes.map((recipe) => (
            <article key={recipe.title} className="card">
              <Image src={recipe.image} alt={recipe.title} width={600} height={360} className="card-image" />
              <div className="card-body">
                <span className="pill">{recipe.category}</span>
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <div className="card-meta">
                  <span>{recipe.time}</span>
                  <span>Easy to follow</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      </AnimatedSection>

      <AnimatedSection>
      <section id="discover" className="section split-section">
        <div>
          <p className="eyebrow">Discover more</p>
          <h2>Everything your kitchen needs in one place.</h2>
          <p className="lead">
            From quick lunches to family dinners, RecipeHub makes it easy to explore recipes, save favorites, and keep your collection organized.
          </p>
          <ul className="feature-list">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <Image src={foodImage} alt="A chef plating a finished meal" width={640} height={500} className="split-image" />
      </section>
      </AnimatedSection>

      <AnimatedSection>
      <section id="about" className="section about-section">
        <div className="about-card">
          <p className="eyebrow">Built for Next.js</p>
          <h2>Modern architecture with a fast, clean experience.</h2>
          <p>
            This version is now powered by Next.js and uses local assets, responsive styling, and a component-driven structure for easier future growth.
          </p>
        </div>
        <Image src={chefImage} alt="A chef pose for the brand" width={480} height={420} className="about-image" />
      </section>
      </AnimatedSection>
    </main>
  );
}
