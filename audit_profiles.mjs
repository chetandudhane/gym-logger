// Gym Logger — Profile & Workout Audit Script
// Run from the gym-log-app folder: node audit_profiles.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDjVRyOlc5PFfxbafBjQzlP123vql1vSXQ",
  authDomain: "gym-logger-by-cd.firebaseapp.com",
  projectId: "gym-logger-by-cd",
  storageBucket: "gym-logger-by-cd.firebasestorage.app",
  messagingSenderId: "520191512916",
  appId: "1:520191512916:web:819d1fb4913a9c278c78c1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'default-gym-log';

async function main() {
  console.log('🔐 Signing in...');
  await signInAnonymously(auth);
  console.log('✅ Signed in.\n');

  // 1. Pull all public workouts (these have ownerId + ownerName)
  console.log('📦 Fetching public workouts...');
  const q = query(
    collection(db, `artifacts/${APP_ID}/public/data/workouts`),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  console.log(`   Found ${snapshot.size} public workout entries.\n`);

  // Build profile map from public workouts
  const profiles = {};
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    const uid = d.ownerId || 'unknown';
    const name = d.ownerName || 'unknown';
    if (!profiles[uid]) profiles[uid] = { name, uid, workouts: [] };
    profiles[uid].workouts.push({ date: d.date || '?', type: d.type || '?' });
  });

  // 2. For each profile, also try to read private workouts (as anonymous, may be denied — that's ok)
  console.log('📋 Profile Summary (sorted by workout count):\n');
  console.log('─'.repeat(60));

  const sorted = Object.values(profiles).sort((a, b) => b.workouts.length - a.workouts.length);

  for (const p of sorted) {
    const dates = p.workouts.map(w => w.date).filter(d => d !== '?').sort();
    const typeCounts = {};
    p.workouts.forEach(w => { typeCounts[w.type] = (typeCounts[w.type] || 0) + 1; });

    console.log(`Name:      "${p.name}"`);
    console.log(`UID:       ${p.uid}`);
    console.log(`Workouts:  ${p.workouts.length}  →  ${JSON.stringify(typeCounts)}`);
    if (dates.length) {
      console.log(`Range:     ${dates[0]}  to  ${dates[dates.length - 1]}`);
    }
    console.log('─'.repeat(60));
  }

  console.log('\n✅ Done. Share this output and we will plan the merge.\n');
  process.exit(0);
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
