import React from 'react';

/**
 * Momentum design-system Card.
 *
 * variant:
 *  - 'default' — cream surface + hairline border. The base for exercise cards,
 *    workout rows, calendar/legend cards, etc.
 *  - 'inverse' — ink-on-cream in light mode (same dark surface color in dark
 *    mode, since the palette's "inverse" and "dark card" tokens coincide). Used
 *    for the StreakBanner — the one card that's always dark.
 */
export default function Card({
  variant = 'default',
  padding = 'p-4',
  className = '',
  children,
  ...props
}) {
  const styles =
    variant === 'inverse'
      ? 'bg-ink dark:bg-surface-d text-ink-d border border-transparent'
      : 'bg-surface dark:bg-surface-d text-ink dark:text-ink-d border border-line dark:border-line-d';
  return (
    <div className={`${styles} rounded-card shadow-card ${padding} ${className}`} {...props}>
      {children}
    </div>
  );
}
