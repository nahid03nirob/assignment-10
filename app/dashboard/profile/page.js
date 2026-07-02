import Link from 'next/link';

export default function ProfilePage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Update your profile</h1>
          <p className="lead">Change your display name and image to personalize the experience.</p>
        </div>
      </header>
      <section className="auth-card">
        <form className="auth-form">
          <div className="field">
            <label>Name</label>
            <input type="text" defaultValue="Ayesha Rahman" />
          </div>
          <div className="field">
            <label>Image URL</label>
            <input type="url" defaultValue="https://example.com/avatar.jpg" />
          </div>
          <button className="button" type="submit">Save Changes</button>
        </form>
      </section>
    </main>
  );
}
