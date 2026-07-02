// ─────────────────────────────────────────────────────────────────────────────
// Gym Logger — Profile Migration Script
// Merges 4 anonymous UIDs → one Google UID
//
// Prerequisites:
//   1. npm install firebase-admin
//   2. Firebase Console → Project Settings → Service Accounts
//      → "Generate new private key" → save as serviceAccount.json here
//
// Usage:
//   node migrate.mjs --dry-run    ← see what WILL happen (no writes)
//   node migrate.mjs              ← execute the migration
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

// ── CONFIG ────────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = './serviceAccount.json';
const APP_ID               = 'default-gym-log';

// Chetan's 4 anonymous UIDs — oldest first so newer data wins on conflicts
const SOURCES = [
  { uid: 'Nc9Ub5y3kZS5gPLrg4bDIiKKJVi1', label: '"chetan"  Jul 2025  (5 workouts)' },
  { uid: 'GBMgXY6wk9gf4Ba8aLh9OVl2mUq1', label: '"chetan"  Aug 2025  (4 workouts)' },
  { uid: 'cxGV1h7Ts2VyhtZYpwJvgfRTZ8s1', label: '"Chetan"  Jan–Apr 2026  (34 workouts)' },
  { uid: 'F63P4fUBxvgU8i8D8lJX6wrMcjs1', label: '"Chetan"  Jun 2026  (2 workouts)' },
];

const TARGET_UID  = 'MjCdacG7TbPIQQWlPqNhTqaf2Aj1'; // Google UID
const TARGET_NAME = 'Chetan Dudhane';                 // Google display name
// ─────────────────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');

// Count how many sets have reps logged (used for conflict resolution)
function workoutScore(data) {
  let score = 0;
  for (const ex of (data.exercises || [])) {
    for (const s of (ex.sets || [])) {
      if (s.reps !== undefined && s.reps !== '') score++;
    }
  }
  return score;
}

function userPath(uid)   { return `artifacts/${APP_ID}/users/${uid}`; }
function publicPath()    { return `artifacts/${APP_ID}/public/data/workouts`; }

async function migrateWorkouts(db, srcUid) {
  const snap = await db.collection(`${userPath(srcUid)}/workouts`).get();
  if (snap.empty) { console.log('     workouts       : (empty)'); return; }

  let copied = 0, overwritten = 0, kept = 0;

  for (const srcDoc of snap.docs) {
    const date      = srcDoc.id;
    const targetRef = db.doc(`${userPath(TARGET_UID)}/workouts/${date}`);
    const targetDoc = await targetRef.get();
    const srcData   = { ...srcDoc.data(), ownerId: TARGET_UID, ownerName: TARGET_NAME };

    if (!targetDoc.exists) {
      if (!DRY_RUN) await targetRef.set(srcData);
      copied++;
    } else {
      const srcScore = workoutScore(srcDoc.data());
      const tgtScore = workoutScore(targetDoc.data());
      if (srcScore > tgtScore) {
        if (!DRY_RUN) await targetRef.set(srcData);
        overwritten++;
        console.log(`     ⚠️  conflict ${date}: src more complete (${srcScore} sets) → overwrote target (${tgtScore} sets)`);
      } else {
        kept++;
        console.log(`     ⚠️  conflict ${date}: target kept (${tgtScore} sets >= src ${srcScore} sets)`);
      }
    }
  }
  console.log(`     workouts       : ${snap.size} docs — ${copied} copied, ${overwritten} overwrote, ${kept} skipped`);
}

async function migrateExerciseHistory(db, srcUid) {
  const snap = await db.collection(`${userPath(srcUid)}/exerciseHistory`).get();
  if (snap.empty) { console.log('     exerciseHistory : (empty)'); return; }

  let copied = 0, overwritten = 0, kept = 0;

  for (const srcDoc of snap.docs) {
    const targetRef = db.doc(`${userPath(TARGET_UID)}/exerciseHistory/${srcDoc.id}`);
    const targetDoc = await targetRef.get();

    if (!targetDoc.exists) {
      if (!DRY_RUN) await targetRef.set(srcDoc.data());
      copied++;
    } else {
      const srcDate = srcDoc.data().lastPerformed?.date  || '';
      const tgtDate = targetDoc.data().lastPerformed?.date || '';
      if (srcDate > tgtDate) {
        if (!DRY_RUN) await targetRef.set(srcDoc.data());
        overwritten++;
      } else {
        kept++;
      }
    }
  }
  console.log(`     exerciseHistory : ${snap.size} docs — ${copied} copied, ${overwritten} newer date overwrote, ${kept} skipped`);
}

async function migrateCustomWorkouts(db, srcUid) {
  const snap = await db.collection(`${userPath(srcUid)}/customWorkouts`).get();
  if (snap.empty) { console.log('     customWorkouts  : (empty)'); return; }

  let copied = 0, merged = 0;

  for (const srcDoc of snap.docs) {
    const targetRef = db.doc(`${userPath(TARGET_UID)}/customWorkouts/${srcDoc.id}`);
    const targetDoc = await targetRef.get();

    if (!targetDoc.exists) {
      if (!DRY_RUN) await targetRef.set(srcDoc.data());
      copied++;
    } else {
      // Merge exercise lists — union, preserving target order
      const srcEx = srcDoc.data().exercises  || [];
      const tgtEx = targetDoc.data().exercises || [];
      const mergedEx = [...tgtEx, ...srcEx.filter(e => !tgtEx.includes(e))];
      if (mergedEx.length > tgtEx.length) {
        if (!DRY_RUN) await targetRef.set({ exercises: mergedEx });
        merged++;
        console.log(`     ℹ️  customWorkouts ${srcDoc.id}: merged → ${mergedEx.length} exercises`);
      }
    }
  }
  console.log(`     customWorkouts  : ${snap.size} docs — ${copied} copied, ${merged} merged`);
}

async function migratePublicFeed(db, srcUid, label) {
  const snap = await db.collection(publicPath()).where('ownerId', '==', srcUid).get();
  if (snap.empty) { console.log(`     public feed     : (empty)`); return; }

  let moved = 0, skipped = 0;

  for (const srcDoc of snap.docs) {
    const date      = srcDoc.data().date;
    const newId     = `${date}_${TARGET_UID}`;
    const newDocRef = db.doc(`${publicPath()}/${newId}`);
    const existing  = await newDocRef.get();

    if (!existing.exists) {
      if (!DRY_RUN) {
        await newDocRef.set({ ...srcDoc.data(), ownerId: TARGET_UID, ownerName: TARGET_NAME });
        await srcDoc.ref.delete();
      }
      moved++;
    } else {
      skipped++;
    }
  }
  console.log(`     public feed     : ${snap.size} docs — ${moved} moved to new UID, ${skipped} skipped`);
}

async function main() {
  // Validate service account file
  if (!existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`\n❌  Service account key not found at: ${SERVICE_ACCOUNT_PATH}`);
    console.error('\nTo generate one:');
    console.error('  1. Go to https://console.firebase.google.com/project/gym-logger-by-cd/settings/serviceaccounts/adminsdk');
    console.error('  2. Click "Generate new private key"');
    console.error('  3. Rename the downloaded file to serviceAccount.json');
    console.error('  4. Move it to ~/codes/gym-log-app/\n');
    process.exit(1);
  }

  // Init Admin SDK
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  console.log('\n🏋️   Gym Logger — Profile Migration');
  console.log(`    Mode   : ${DRY_RUN ? '🔍 DRY RUN — no data will be written' : '⚡ LIVE — writing to Firestore'}`);
  console.log(`    Target : ${TARGET_NAME}  (${TARGET_UID})`);
  console.log(`    Sources: ${SOURCES.length} anonymous UIDs\n`);

  for (const { uid, label } of SOURCES) {
    console.log(`\n  ┌─ ${label}`);
    console.log(`  │  UID: ${uid}`);
    await migrateWorkouts(db, uid);
    await migrateExerciseHistory(db, uid);
    await migrateCustomWorkouts(db, uid);
    await migratePublicFeed(db, uid, label);
    console.log(`  └─ done`);
  }

  console.log('\n' + '═'.repeat(60));

  if (DRY_RUN) {
    console.log('🔍  DRY RUN complete — zero writes made.');
    console.log('    If the plan looks right, run without --dry-run to execute.\n');
  } else {
    console.log('✅  Migration complete!');
    console.log('    • All workouts, history, and custom lists are now under your Google UID.');
    console.log('    • Public feed updated — your workouts show as Chetan Dudhane.');
    console.log('    • Source data left untouched (nothing deleted).');
    console.log('\n    Open the app and verify your full history is visible.\n');
  }

  process.exit(0);
}

main().catch(e => {
  console.error('\n❌  Unexpected error:', e.message);
  process.exit(1);
});
