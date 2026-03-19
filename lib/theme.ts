// lib/theme.ts
import React from 'react';

export const default_palette = {
  primary: '#6B2C3E',
  secondary: '#D4598F',
  base: '#FAF7F2',
  neutral: '#6B6560',
  border: '#E8E5E0',
  success: '#4A7C59',
  warning: '#D97706',
  error: '#B91C1C',
};

/**
 * Converts a palette object into a React CSS Properties object
 * with CSS Custom Properties (Variables).
 */
export const getPaletteStyles = (palette = default_palette): React.CSSProperties => {
  return {
    '--color-primary': palette.primary,
    '--color-secondary': palette.secondary,
    '--color-base': palette.base,
    '--color-neutral': palette.neutral,
    '--color-border': palette.border,
    '--color-success': palette.success,
    '--color-warning': palette.warning,
    '--color-error': palette.error,
  } as React.CSSProperties;
};