import React, { useEffect } from 'react';
import { Trophy } from 'lucide-react';

// Confetti mixes the accent with the four workout-type colors, per README §5.
const CONFETTI_COLORS = ['#e8622a', '#3f7cae', '#7d6bb3', '#5f8f5a', '#b98a3f'];

/** Full-screen dimmed + blurred overlay, falling confetti, centered "new
 *  personal record" card. Auto-dismisses after ~3.2s (same timing as before).
 *  `pr` = { exercise, weight, previousBest? } — previousBest is optional so this
 *  primitive works even before WorkoutLog is wired to pass it through. Respects
 *  prefers-reduced-motion by skipping confetti. */
export default function PrCelebration({ pr, onDone }) {
  useEffect(() => {
    const h = setTimeout(onDone, 3200);
    return () => clearTimeout(h);
  }, [onDone]);

  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const pieces = reduceMotion ? [] : Array.from({ length: 32 });
  const delta = pr.previousBest != null ? pr.weight - pr.previousBest : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(11,9,7,0.82)] backdrop-blur-sm">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {pieces.map((_, i) => (
          <span
            key={i}
            className="absolute top-0 w-1.5 h-1.5 animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${Math.random() * 0.6}s`,
              animationDuration: `${1.8 + Math.random() * 1.4}s`,
            }}
          />
        ))}
      </div>
      <div className="relative bg-surface dark:bg-surface-d rounded-card shadow-modal px-8 py-7 text-center max-w-xs">
        <div className="w-16 h-16 rounded-full bg-accent-soft dark:bg-accent-soft-d flex items-center justify-center mx-auto mb-4">
          <Trophy className="text-accent dark:text-accent-d" size={28} />
        </div>
        <p className="text-[11px] font-sans font-bold uppercase tracking-[1.4px] text-accent dark:text-accent-d mb-2">
          New personal record
        </p>
        <p className="font-display font-bold uppercase tracking-[0.5px] text-lg text-ink dark:text-ink-d mb-1">
          {pr.exercise}
        </p>
        <p className="font-display font-extrabold text-accent dark:text-accent-d leading-none" style={{ fontSize: 64 }}>
          {pr.weight}
          <span className="text-2xl align-top ml-1">kg</span>
        </p>
        {pr.previousBest != null && (
          <p className="text-[13px] text-muted dark:text-muted-d mt-3">
            Previous best {pr.previousBest} kg{delta ? ` · +${delta} kg` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
