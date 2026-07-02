import { recipes } from '../lib/mockData';

const stats = [
  { label: 'Total Users', value: '2' },
  { label: 'Total Recipes', value: String(recipes.length) },
  { label: 'Premium Members', value: '1' },
  { label: 'Reports', value: '3' }
];

export default function AdminPage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Platform overview</h1>
          <p className="lead">Monitor users, recipes, reports, and premium activity from one place.</p>
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
      <section className="card-grid">
        <article className="card">
          <div className="card-body">
            <h3>Manage Users</h3>
            <p>Review accounts, block or unblock users, and maintain platform safety.</p>
          </div>
        </article>
        <article className="card">
          <div className="card-body">
            <h3>Manage Recipes</h3>
            <p>Feature recipes, edit entries, and remove content when needed.</p>
          </div>
        </article>
        <article className="card">
          <div className="card-body">
            <h3>Reports</h3>
            <p>Review spam, offensive content, and copyright issues from users.</p>
          </div>
        </article>
      </section>
    </main>
  );
}
