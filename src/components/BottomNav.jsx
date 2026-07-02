import React from 'react';
import { NAV_ITEMS } from './navItems';

/** Mobile bottom tab bar (Log · Calendar · Me · Community). Fixed to the
 *  viewport bottom; active tab renders in accent. Hidden at md+ where Sidebar
 *  takes over. */
export default function BottomNav({ active, onSelect }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface dark:bg-surface-d border-t border-line dark:border-line-d shadow-dock">
      <div className="flex items-stretch justify-around px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button key={item.key} onClick={() => onSelect(item.key)} className="flex flex-col items-center gap-1 py-2.5 px-3 flex-1">
              <Icon size={22} className={isActive ? 'text-accent dark:text-accent-d' : 'text-muted dark:text-muted-d'} />
              <span className={`text-[11px] font-sans font-medium ${isActive ? 'text-accent dark:text-accent-d' : 'text-muted dark:text-muted-d'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
