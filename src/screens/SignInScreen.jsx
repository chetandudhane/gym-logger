import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import Button from '../components/Button';

// Google logo SVG (official brand colours) — unchanged from the original app.
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

/**
 * Onboarding / sign-in (README §1). The design mock also shows a "pick a
 * profile" no-account alternative — not built here, since the current app
 * only supports Google auth and adding a second auth model would be a
 * feature/data-model change, not the visual pass this redesign is scoped to.
 */
export default function SignInScreen({ onSignIn }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      await onSignIn();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cream dark:bg-night px-6">
      <div className="w-full max-w-xs text-center">
        <div className="w-20 h-20 rounded-card bg-accent-soft dark:bg-accent-soft-d flex items-center justify-center mx-auto mb-6">
          <Dumbbell className="text-accent dark:text-accent-d" size={36} />
        </div>
        <h1 className="font-display font-extrabold uppercase tracking-[0.5px] text-[40px] leading-[0.95] text-ink dark:text-ink-d mb-3">
          Gym<br />Logger
        </h1>
        <p className="font-sans text-sm text-muted dark:text-muted-d mb-10">
          Track your workouts. Sync across all your devices.
        </p>
        <Button variant="primary" fullWidth onClick={handleClick} disabled={loading}>
          {loading
            ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <GoogleIcon />}
          <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
        </Button>
        {error && <p className="text-accent dark:text-accent-d text-sm mt-4">{error}</p>}
        <p className="text-[11px] text-faint dark:text-muted-2d mt-8">
          By continuing you agree to sync your workout data to your Google account.
        </p>
      </div>
    </div>
  );
}
