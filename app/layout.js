import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import './globals.css';

export const metadata = {
  title: 'RecipeHub | Next.js Recipe Platform',
  description: 'A modern recipe sharing platform built with Next.js.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link href="/" className="brand">
              <span className="brand-mark">R</span>
              <span>RecipeHub</span>
            </Link>
            <nav className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/recipes">Browse Recipes</Link>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
              <Link href="/dashboard">Dashboard</Link>
              <ThemeToggle />
            </nav>
          </header>
          {children}
          <footer className="footer">
            <div>
              <h3>RecipeHub</h3>
              <p>Share meals, save favorites, and discover your next favorite dish.</p>
            </div>
            <div>
              <h3>Quick Links</h3>
              <Link href="/">Home</Link>
              <Link href="/recipes">Recipes</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
            <div>
              <h3>Social</h3>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            </div>
            <div>
              <h3>Contact</h3>
              <p>hello@recipehub.example</p>
              <p>+880 1700 000000</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
