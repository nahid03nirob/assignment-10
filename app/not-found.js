import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page-shell not-found">
      <div className="auth-card">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="lead">The page you are looking for does not exist or has moved.</p>
        <Link href="/" className="button">Back Home</Link>
      </div>
    </main>
  );
}
