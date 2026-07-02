import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="page-shell auth-page">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Login to RecipeHub</h1>
        <p className="lead">Use your credentials or continue with Google-style demo sign in.</p>
        <form className="auth-form">
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••" />
          </div>
          <button className="button" type="submit">Login</button>
        </form>
        <p className="muted-text">Don’t have an account? <Link href="/register" className="text-link">Register</Link></p>
      </section>
    </main>
  );
}
