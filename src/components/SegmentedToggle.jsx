import React from 'react';

/** Pill toggle used for exercise variants (e.g. Flat / Incline). Active segment is
 *  solid accent. Helper needed by ExerciseCard — listed in the component
 *  inventory alongside it. */
export default function SegmentedToggle({ options, value, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-1 bg-surface2 dark:bg-surface2-d p-1 rounded-chip">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt)}
          className={`flex-1 text-center text-sm font-sans font-medium py-1.5 rounded-chip transition-colors disabled:opacity-50 ${
            value === opt
              ? 'bg-accent dark:bg-accent-d text-white shadow-card'
              : 'text-muted dark:text-muted-d hover:bg-surface dark:hover:bg-surface-d'
          }`}
        >
          {opt.replace(/&/g, ' & ')}
        </button>
      ))}
    </div>
  );
}
