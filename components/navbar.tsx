'use client'

import { default_palette as theme } from '@/lib/theme';

export const Navbar = () => {
  return (
    <nav 
      style={{ borderBottomColor: theme.primary }}
      className="w-full border-b border-solid"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <span 
          style={{ color: theme.primary }}
          className="text-2xl font-semibold"
        >
          DYO
        </span>
      </div>
    </nav>
  );
};
