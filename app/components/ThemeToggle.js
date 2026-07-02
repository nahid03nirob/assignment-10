'use client';

import { useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button className="button-outline" onClick={toggleTheme} type="button">
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
}
