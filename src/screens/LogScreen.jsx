import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { Plus, Sun, Moon } from 'lucide-react';
import { db, appId } from '../lib/firebase';
import { formatShortDate } from '../lib/helpers';
import { useWorkoutTypesMeta } from '../lib/useWorkoutTypesMeta';
import StreakBanner from '../components/StreakBanner';
import SectionLabel from '../components/SectionLabel';
import WorkoutRow from '../components/WorkoutRow';
import Button from '../components/Button';

/**
 * Log tab — "choose a workout" (README §2, the key layout change: 2×2 grid ->
 * vertical list). Renders dynamically from the user's customWorkouts
 * collection via useWorkoutTypesMeta: the 4 presets always show first, any
 * user-added types follow, ending in the dashed "Add workout type" row.
 * Adding a type just writes an empty customWorkouts/{TYPE} doc — the same
 * collection & shape the rest of the app already reads/writes, so this is
 * additive, not a data-model change.
 *
 * `theme`/`onToggleTheme` are optional and only render a toggle on mobile
 * (md:hidden) — Sidebar already has its own toggle on desktop, so this just
 * fills the gap where BottomNav has no dark-mode control at all.
 */
export default function LogScreen({ user, onSelectType, theme, onToggleTheme, onUpdateWeeklyGoal }) {
  const types = useWorkoutTypesMeta(user);
  const [adding, setAdding] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddType = async () => {
    const name = newTypeName.trim().toUpperCase().replace(/\s+/g, ' ');
    if (!name) return;
    if (types.some((t) => t.type === name)) {
      onSelectType(name);
      setAdding(false);
      setNewTypeName('');
      return;
    }
    setSaving(true);
    try {
      const ref = doc(db, `artifacts/${appId}/users/${user.uid}/customWorkouts`, name);
      await setDoc(ref, { exercises: [] });
      onSelectType(name);
    } finally {
      setSaving(false);
      setAdding(false);
      setNewTypeName('');
    }
  };

  return (
    <div className="px-5 py-5 md:px-10 md:py-10 max-w-[600px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-extrabold uppercase tracking-[0.5px] text-[34px] leading-none text-ink dark:text-ink-d">
          Log
        </h1>
        <div className="flex items-center gap-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Toggle dark mode"
              className="md:hidden p-2 -m-2 text-muted dark:text-muted-d hover:text-accent dark:hover:text-accent-d transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <div className="w-[34px] h-[34px] rounded-full bg-accent-soft dark:bg-accent-soft-d flex items-center justify-center text-accent dark:text-accent-d text-sm font-sans font-bold shrink-0">
            {user?.displayName?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <StreakBanner user={user} onUpdateWeeklyGoal={onUpdateWeeklyGoal} />
      </div>

      <SectionLabel className="mb-3">Choose a workout</SectionLabel>
      <div className="space-y-2.5">
        {types.map(({ type, last }) => (
          <WorkoutRow
            key={type}
            type={type}
            meta={last ? `Last · ${formatShortDate(last.date)} · ${last.exerciseCount} exercise${last.exerciseCount === 1 ? '' : 's'}` : 'Not logged yet'}
            onClick={() => onSelectType(type)}
          />
        ))}

        {adding ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
              placeholder="e.g. CARDIO"
              className="w-full px-4 py-3 rounded-card border border-line-input dark:border-line-input-d bg-surface dark:bg-surface-d text-ink dark:text-ink-d font-sans focus:outline-none focus:ring-2 focus:ring-accent/40 dark:focus:ring-accent-d/40"
            />
            <Button variant="primary" onClick={handleAddType} disabled={saving}>
              {saving ? '…' : 'Add'}
            </Button>
          </div>
        ) : (
          <Button variant="dashed" fullWidth onClick={() => setAdding(true)} className="justify-center">
            <Plus size={16} /> Add workout type
          </Button>
        )}
      </div>
    </div>
  );
}
