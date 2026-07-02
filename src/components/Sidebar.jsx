import React from 'react';
import { Dumbbell, Sun, Moon, LogOut } from 'lucide-react';
import { NAV_ITEMS } from './navItems';

/** Desktop 248px left sidebar: logo/wordmark, nav list, spacer, an optional
 *  streak-card slot, then a profile row + dark-mode toggle. Replaces BottomNav
 *  at md+ (README "Desktop (secondary target)"). */
export default function Sidebar({ active, onSelect, user, theme, onToggleTheme, onSignOut, streakSlot }) {
  return (
    <aside className="hidden md:flex md:flex-col w-[248px] shrink-0 h-screen sticky top-0 bg-surface dark:bg-surface-d border-r border-line dark:border-line-d px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-chip bg-accent-soft dark:bg-accent-soft-d flex items-center justify-center">
          <Dumbbell className="text-accent dark:text-accent-d" size={20} />
        </div>
        <span className="font-display font-extrabold uppercase tracking-[0.5px] text-lg text-ink dark:text-ink-d">
          Gym Logger
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-chip text-sm font-sans font-semibold transition-colors ${
                isActive
                  ? 'bg-accent-soft dark:bg-accent-soft-d text-accent dark:text-accent-d'
                  : 'text-muted dark:text-muted-d hover:bg-surface2 dark:hover:bg-surface2-d'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      {streakSlot && <div className="mb-4">{streakSlot}</div>}

      <div className="flex items-center justify-between px-2 pt-4 border-t border-line dark:border-line-d">
        <div className="flex items-center gap-2 min-w-0">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-accent dark:bg-accent-d flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.displayName?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-sm font-sans font-semibold text-ink dark:text-ink-d truncate">{user?.displayName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onToggleTheme} aria-label="Toggle dark mode" className="text-muted dark:text-muted-d hover:text-accent dark:hover:text-accent-d transition-colors">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={onSignOut} aria-label="Sign out" className="text-muted dark:text-muted-d hover:text-accent dark:hover:text-accent-d transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
