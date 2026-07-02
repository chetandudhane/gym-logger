import React from 'react';

/**
 * Momentum design-system Button.
 *
 * variant:
 *  - 'primary' — solid accent fill, white text, 54px tall. The one primary action
 *    on a screen (Continue with Google, primary CTA).
 *  - 'ghost'   — accent-colored text/icon only. Lightweight actions ("+ Add set").
 *  - 'dashed'  — dashed accent border, accent text. Reserved for "Add …"
 *    affordances only (Add workout type, Add exercise) per the design system's
 *    "orange is precious" rule.
 */
const base =
  'inline-flex items-center justify-center gap-2 font-sans font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary:
    'bg-accent hover:opacity-90 dark:bg-accent-d text-white rounded-card h-[54px] px-6 shadow-card',
  ghost:
    'text-accent dark:text-accent-d hover:bg-accent-soft dark:hover:bg-accent-soft-d rounded-chip px-3 py-2',
  dashed:
    'text-accent dark:text-accent-d border-2 border-dashed border-accent/40 dark:border-accent-d/40 hover:bg-accent-soft dark:hover:bg-accent-soft-d rounded-card px-4 py-3',
};

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
