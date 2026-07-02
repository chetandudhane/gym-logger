import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Dumbbell } from 'lucide-react';
import { auth, db, appId } from './lib/firebase';
import { useTheme } from './lib/useTheme';
import { RestTimerProvider } from './components/RestTimer';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import SignInScreen from './screens/SignInScreen';
import LogScreen from './screens/LogScreen';
import WorkoutLogScreen from './screens/WorkoutLogScreen';
import CalendarScreen from './screens/CalendarScreen';
import MyWorkoutsScreen from './screens/MyWorkoutsScreen';
import CommunityScreen from './screens/CommunityScreen';

/**
 * App shell: auth flow, theme, nav (BottomNav on mobile / Sidebar on
 * desktop), and view routing. All screen-specific logic now lives in
 * src/screens/*; this file only wires them together. Firebase init, Firestore
 * paths, and the auth/profile bootstrap logic below are unchanged from the
 * original App.jsx — only relocated (init -> src/lib/firebase.js).
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading'); // loading | needsSignIn | ready | error
  const [currentView, setCurrentView] = useState('log');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState(null);
  const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const profileDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/profile`, 'data');
          const profileDoc = await getDoc(profileDocRef);
          if (profileDoc.exists()) {
            // Returning user — use stored profile merged with live Firebase user
            setUser({ ...currentUser, ...profileDoc.data() });
          } else {
            // First Google sign-in — auto-create profile from Google account
            const profileData = {
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL || null,
              createdAt: Timestamp.now(),
            };
            await setDoc(profileDocRef, profileData);
            setUser({ ...currentUser, ...profileData });
          }
          setAuthStatus('ready');
        } catch (error) {
          console.error('Profile setup failed:', error);
          setAuthStatus('error');
        }
      } else {
        setAuthStatus('needsSignIn');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged handles the rest
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setSelectedWorkoutType(null);
    setCurrentView('log');
    setAuthStatus('needsSignIn');
  };

  const handleSelectView = (view) => {
    setSelectedWorkoutType(null);
    setCurrentView(view);
  };

  const handleUpdateWeeklyGoal = async (newGoal) => {
    if (!user) return;
    const profileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
    await setDoc(profileDocRef, { weeklyGoal: newGoal }, { merge: true });
    setUser((prev) => (prev ? { ...prev, weeklyGoal: newGoal } : prev));
  };

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream dark:bg-night">
        <div className="text-center">
          <Dumbbell className="w-14 h-14 text-accent dark:text-accent-d animate-bounce mx-auto" />
          <p className="font-sans text-muted dark:text-muted-d mt-4">Getting things ready…</p>
        </div>
      </div>
    );
  }
  if (authStatus === 'needsSignIn') {
    return <SignInScreen onSignIn={handleGoogleSignIn} />;
  }
  if (!user || authStatus === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream dark:bg-night">
        <p className="text-accent dark:text-accent-d font-sans">Something went wrong. Please refresh the page.</p>
      </div>
    );
  }

  const renderView = () => {
    if (selectedWorkoutType) {
      return <WorkoutLogScreen user={user} workoutType={selectedWorkoutType} onBack={() => setSelectedWorkoutType(null)} />;
    }
    switch (currentView) {
      case 'log':
        return <LogScreen user={user} onSelectType={setSelectedWorkoutType} theme={theme} onToggleTheme={toggleTheme} onUpdateWeeklyGoal={handleUpdateWeeklyGoal} />;
      case 'calendar':
        return <CalendarScreen user={user} />;
      case 'me':
        return <MyWorkoutsScreen user={user} />;
      case 'community':
        return <CommunityScreen />;
      default:
        return <LogScreen user={user} onSelectType={setSelectedWorkoutType} theme={theme} onToggleTheme={toggleTheme} onUpdateWeeklyGoal={handleUpdateWeeklyGoal} />;
    }
  };

  const activeNavKey = selectedWorkoutType ? 'log' : currentView;

  return (
    <RestTimerProvider>
      <div className="min-h-screen bg-cream dark:bg-night font-sans text-ink dark:text-ink-d flex">
        <Sidebar
          active={activeNavKey}
          onSelect={handleSelectView}
          user={user}
          theme={theme}
          onToggleTheme={toggleTheme}
          onSignOut={handleSignOut}
        />
        <div className="flex-1 min-w-0">
          <main className="pb-24 md:pb-8">{renderView()}</main>
          <BottomNav active={activeNavKey} onSelect={handleSelectView} />
        </div>
      </div>
    </RestTimerProvider>
  );
}
