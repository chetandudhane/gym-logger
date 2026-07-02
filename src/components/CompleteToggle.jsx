import React from 'react';
import { Check } from 'lucide-react';

/** Empty ring ↔ solid-accent circle with a check. Marks a set complete; the
 *  caller (SetRow) is responsible for starting the rest timer on completion.
 *  26px visual size with a padded ≥44px hit area per the spacing spec. */
export default function CompleteToggle({ completed, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={completed}
      aria-label={completed ? 'Mark set incomplete' : 'Mark set complete'}
      className="p-2 disabled:opacity-50"
    >
      <span
        className={`flex items-center justify-center w-[26px] h-[26px] rounded-full transition-colors ${
          completed
            ? 'bg-accent dark:bg-accent-d'
            : 'border-[1.8px] border-line-input dark:border-line-input-d'
        }`}
      >
        {completed && <Check size={16} className="text-white" strokeWidth={3} />}
      </span>
    </button>
  );
}
