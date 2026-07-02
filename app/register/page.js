import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="page-shell auth-page">
      <section className="auth-card">
        <p className="eyebrow">Join us</p>
        <h1>Create your account</h1>
        <p className="lead">Create an account with a strong password and start sharing recipes.</p>
        <form className="auth-form">
          <div className="field">
            <label>Name</label>
            <input type="text" placeholder="Your name" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Image URL</label>
            <input type="url" placeholder="https://example.com/avatar.jpg" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Min 6 chars" />
          </div>
          <button className="button" type="submit">Register</button>
        </form>
        <p className="muted-text">Already registered? <Link href="/login" className="text-link">Login</Link></p>
      </section>
    </main>
  );
}
