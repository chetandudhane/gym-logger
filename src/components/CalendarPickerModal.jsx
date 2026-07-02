import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalDateString } from '../lib/helpers';

/** Small month-picker modal opened from DateChip to back-log another date.
 *  Restyled 1:1 port of the original DatePickerModal — same behavior. */
export default function CalendarPickerModal({ currentDate, onDateSelect, onClose }) {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const days = [];
  for (let i = 0; i < startOfMonth.getDay(); i++) days.push(null);
  for (let i = 1; i <= new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate(); i++) {
    days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), i));
  }
  const changeMonth = (offset) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(11,9,7,0.6)] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface dark:bg-surface-d rounded-win shadow-modal w-full max-w-xs p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-chip hover:bg-surface2 dark:hover:bg-surface2-d text-muted dark:text-muted-d transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-display font-bold uppercase tracking-[0.5px] text-base text-ink dark:text-ink-d">
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-chip hover:bg-surface2 dark:hover:bg-surface2-d text-muted dark:text-muted-d transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-sans font-semibold text-muted dark:text-muted-d mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <div key={i} className="h-9 flex items-center justify-center">
              {day && (
                <button
                  onClick={() => onDateSelect(getLocalDateString(day))}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-sans transition-colors ${
                    getLocalDateString(day) === currentDate
                      ? 'bg-accent dark:bg-accent-d text-white font-semibold'
                      : 'hover:bg-surface2 dark:hover:bg-surface2-d text-ink dark:text-ink-d'
                  }`}
                >
                  {day.getDate()}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
