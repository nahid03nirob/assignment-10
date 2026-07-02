import Link from 'next/link';

const stats = [
  { label: 'Total Recipes', value: '6' },
  { label: 'Total Favorites', value: '4' },
  { label: 'Likes Received', value: '1.2K' },
  { label: 'Premium Badge', value: 'Active' }
];

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">User dashboard</p>
          <h1>Welcome back, Ayesha</h1>
          <p className="lead">Manage your recipes, favorites, purchases, and profile from one place.</p>
        </div>
      </header>

      <section className="stat-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-links">
        <Link href="/dashboard/recipes" className="button-outline">My Recipes</Link>
        <Link href="/dashboard/favorites" className="button-outline">My Favorites</Link>
        <Link href="/dashboard/purchases" className="button-outline">Purchased Recipes</Link>
        <Link href="/dashboard/profile" className="button-outline">Profile</Link>
      </section>
    </main>
  );
}
