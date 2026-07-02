import React from 'react';
import Card from './Card';
import TypeChip from './TypeChip';

/** Community feed card (README §8): avatar + name + relative time + type chip
 *  + one-line summary. */
export default function FeedCard({ workout, summary, relativeTime, onClick }) {
  const initial = workout.ownerName?.[0]?.toUpperCase() || '?';
  return (
    <button onClick={onClick} className="w-full text-left">
      <Card className="hover:shadow-dock transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent-soft dark:bg-accent-soft-d flex items-center justify-center text-accent dark:text-accent-d text-xs font-sans font-bold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-sans font-semibold text-ink dark:text-ink-d truncate">{workout.ownerName}</p>
            <p className="text-[11px] text-muted dark:text-muted-d">{relativeTime}</p>
          </div>
          <TypeChip type={workout.type} />
        </div>
        <p className="text-[13.5px] font-sans text-muted dark:text-muted-d">{summary}</p>
      </Card>
    </button>
  );
}
