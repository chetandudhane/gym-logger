import React from 'react';

/** On-brand empty state for Me / Calendar / Community. */
export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-16">
      {Icon && <Icon className="w-12 h-12 text-faint dark:text-muted-2d mx-auto mb-4" />}
      <p className="font-sans font-semibold text-ink dark:text-ink-d">{title}</p>
      {subtitle && <p className="font-sans text-sm text-muted dark:text-muted-d mt-1.5">{subtitle}</p>}
    </div>
  );
}
