import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Timer } from 'lucide-react';

// --- device-feedback helpers (unchanged from App.jsx) ---
const vibrate = (pattern) => {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch { /* unsupported */ }
};

let audioCtx = null;
const playBeep = (count = 2) => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let t = audioCtx.currentTime;
    for (let i = 0; i < count; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.start(t);
      osc.stop(t + 0.2);
      t += 0.28;
    }
  } catch { /* audio not available */ }
};

const formatTime = (s) => {
  const safe = Math.max(0, s);
  const m = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const RestTimerContext = createContext({ start: () => {} });
// The hook lives here (not split into its own file) because it's tightly coupled
// to RestTimerContext/RestTimerProvider — same pattern the codebase already uses.
// eslint-disable-next-line react-refresh/only-export-components
export const useRestTimer = () => useContext(RestTimerContext);

/** Floating rest timer bar. Mobile: fixed bottom, full width. Desktop (md+):
 *  docks bottom-right of the content column instead (README §4/§Desktop). */
function RestTimerBar({ secondsLeft, total, onStop, onAdjust, onRestart }) {
  const done = secondsLeft <= 0;
  const pct = total > 0 ? Math.max(0, Math.min(100, (secondsLeft / total) * 100)) : 0;
  return (
    <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md md:left-auto md:right-6 md:translate-x-0 md:bottom-6 md:w-80">
      <div className="bg-surface2 dark:bg-surface2-d rounded-bar shadow-dock p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-accent dark:text-accent-d" />
            <span className="text-[11px] font-sans font-bold uppercase tracking-[1.4px] text-muted dark:text-muted-d">
              {done ? 'Rest done' : 'Rest'}
            </span>
          </div>
          <span className="font-display font-extrabold text-[28px] leading-none text-ink dark:text-ink-d">
            {formatTime(secondsLeft)}
          </span>
        </div>
        <div className="h-1.5 bg-line-input dark:bg-line-input-d rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-accent dark:bg-accent-d transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onAdjust(-15)} className="flex-1 py-2 text-sm font-sans font-medium rounded-chip bg-surface dark:bg-surface-d text-ink dark:text-ink-d hover:opacity-80 transition-opacity">
            −15s
          </button>
          <button onClick={() => onAdjust(15)} className="flex-1 py-2 text-sm font-sans font-medium rounded-chip bg-surface dark:bg-surface-d text-ink dark:text-ink-d hover:opacity-80 transition-opacity">
            +15s
          </button>
          <button onClick={onRestart} className="flex-1 py-2 text-sm font-sans font-medium rounded-chip bg-surface dark:bg-surface-d text-ink dark:text-ink-d hover:opacity-80 transition-opacity">
            Restart
          </button>
          <button onClick={onStop} className="flex-1 py-2 text-sm font-sans font-semibold rounded-chip bg-accent dark:bg-accent-d text-white hover:opacity-90 transition-opacity">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

/** Identical behavior to the current RestTimerProvider: start(duration) begins/
 *  replaces the countdown, beeps + vibrates at zero, auto-dismisses after 2s.
 *  Default duration persists to localStorage per device. */
export function RestTimerProvider({ children }) {
  const [secondsLeft, setSecondsLeft] = useState(null); // null = hidden
  const [total, setTotal] = useState(90);
  const [duration, setDuration] = useState(() => {
    const v = Number(localStorage.getItem('restDuration'));
    return v && v > 0 ? v : 90;
  });
  const finishedRef = useRef(false);

  const start = useCallback((d) => {
    const dur = d ?? duration;
    setDuration(dur);
    try { localStorage.setItem('restDuration', String(dur)); } catch { /* ignore */ }
    setTotal(dur);
    setSecondsLeft(dur);
    finishedRef.current = false;
  }, [duration]);

  const stop = useCallback(() => setSecondsLeft(null), []);
  const adjust = useCallback((delta) => {
    setSecondsLeft((s) => (s == null ? s : Math.max(0, s + delta)));
    setTotal((t) => Math.max(15, t + delta));
  }, []);

  useEffect(() => {
    if (secondsLeft == null) return;
    if (secondsLeft <= 0) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        playBeep(3);
        vibrate([200, 100, 200]);
      }
      const h = setTimeout(() => setSecondsLeft(null), 2000);
      return () => clearTimeout(h);
    }
    const h = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(h);
  }, [secondsLeft]);

  return (
    <RestTimerContext.Provider value={{ start }}>
      {children}
      {secondsLeft != null && (
        <RestTimerBar
          secondsLeft={secondsLeft}
          total={total}
          onStop={stop}
          onAdjust={adjust}
          onRestart={() => start(duration)}
        />
      )}
    </RestTimerContext.Provider>
  );
}
