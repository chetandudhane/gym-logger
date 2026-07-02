// ─────────────────────────────────────────────────────────────────────────────
// Gym Logger — Account Migration  (chetan.dudhane@gmail.com → cdudhane@gmail.com)
//
// COPY-ONLY: nothing is deleted. The source account is left fully intact as a
// backup. Run dry-run first, then live.
//
// Usage:
//   node migrate_to_cdudhane.mjs --dry-run   ← see what WILL happen (no writes)
//   node migrate_to_cdudhane.mjs             ← execute the copy
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

// ── CONFIG ──────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = './serviceAccount.json';
const APP_ID               = 'default-gym-log';

const SOURCE_UID  = 'MjCdacG7TbPIQQWlPqNhTqaf2Aj1'; // chetan.dudhane@gmail.com (data lives here)
const TARGET_UID  = 'LPBn5B8YYtRZpHV5RpONNyfPLlP2'; // cdudhane@gmail.com (new home)
let   TARGET_NAME = 'Chetan Dudhane';                // overwritten from target profile if present
// ──────────────────────────────────────────────────────────────────────────--

const DRY_RUN = process.argv.includes('--dry-run');

function userPath(uid) { return `artifacts/${APP_ID}/users/${uid}`; }
function publicPath()  { return `artifacts/${APP_ID}/public/data/workouts`; }

function workoutScore(data) {
  let score = 0;
  for (const ex of (data.exercises || [])) {
    for (const s of (ex.sets || [])) {
      if (s.reps !== undefined && s.reps !== '') score++;
    }
  }
  return score;
}

async function copyWorkouts(db) {
  const snap = await db.collection(`${userPath(SOURCE_UID)}/workouts`).get();
  if (snap.empty) { console.log('     workouts        : (empty)'); return; }
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
        console.log(`     ⚠️  conflict ${date}: source more complete (${srcScore} vs ${tgtScore}) → would overwrite target`);
      } else {
        kept++;
        console.log(`     ⚠️  conflict ${date}: target kept (${tgtScore} >= source ${srcScore})`);
      }
    }
  }
  console.log(`     workouts        : ${snap.size} docs — ${copied} copy, ${overwritten} overwrite, ${kept} skip`);
}

async function copyExerciseHistory(db) {
  const snap = await db.collection(`${userPath(SOURCE_UID)}/exerciseHistory`).get();
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
      if (srcDate > tgtDate) { if (!DRY_RUN) await targetRef.set(srcDoc.data()); overwritten++; }
      else { kept++; }
    }
  }
  console.log(`     exerciseHistory : ${snap.size} docs — ${copied} copy, ${overwritten} overwrite, ${kept} skip`);
}

async function copyCustomWorkouts(db) {
  const snap = await db.collection(`${userPath(SOURCE_UID)}/customWorkouts`).get();
  if (snap.empty) { console.log('     customWorkouts  : (empty)'); return; }
  let copied = 0, merged = 0;
  for (const srcDoc of snap.docs) {
    const targetRef = db.doc(`${userPath(TARGET_UID)}/customWorkouts/${srcDoc.id}`);
    const targetDoc = await targetRef.get();
    if (!targetDoc.exists) {
      if (!DRY_RUN) await targetRef.set(srcDoc.data());
      copied++;
    } else {
      const srcEx = srcDoc.data().exercises  || [];
      const tgtEx = targetDoc.data().exercises || [];
      const mergedEx = [...tgtEx, ...srcEx.filter(e => !tgtEx.includes(e))];
      if (mergedEx.length > tgtEx.length) {
        if (!DRY_RUN) await targetRef.set({ exercises: mergedEx });
        merged++;
      }
    }
  }
  console.log(`     customWorkouts  : ${snap.size} docs — ${copied} copy, ${merged} merged`);
}

async function copyPublicFeed(db) {
  const snap = await db.collection(publicPath()).where('ownerId', '==', SOURCE_UID).get();
  if (snap.empty) { console.log('     public feed     : (empty)'); return; }
  let copied = 0, skipped = 0;
  for (const srcDoc of snap.docs) {
    const date      = srcDoc.data().date;
    const newId     = `${date}_${TARGET_UID}`;
    const newDocRef = db.doc(`${publicPath()}/${newId}`);
    const existing  = await newDocRef.get();
    if (!existing.exists) {
      if (!DRY_RUN) await newDocRef.set({ ...srcDoc.data(), ownerId: TARGET_UID, ownerName: TARGET_NAME });
      copied++;
    } else {
      skipped++;
    }
  }
  console.log(`     public feed     : ${snap.size} docs — ${copied} copy (source NOT deleted), ${skipped} skip`);
}

async function main() {
  if (!existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`\n❌  Service account key not found at: ${SERVICE_ACCOUNT_PATH}\n`);
    process.exit(1);
  }
  const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  // Use the target account's real display name (auto-created on first Google login)
  try {
    const prof = await db.doc(`${userPath(TARGET_UID)}/profile/data`).get();
    if (prof.exists && prof.data().displayName) TARGET_NAME = prof.data().displayName;
  } catch (e) { /* keep default */ }

  console.log('\n🏋️   Gym Logger — Account Migration (COPY-ONLY, no deletions)');
  console.log(`    Mode   : ${DRY_RUN ? '🔍 DRY RUN — no data will be written' : '⚡ LIVE — writing to Firestore'}`);
  console.log(`    Source : ${SOURCE_UID}  (chetan.dudhane@gmail.com)`);
  console.log(`    Target : ${TARGET_NAME}  ${TARGET_UID}  (cdudhane@gmail.com)`);

  console.log(`\n  ┌─ copying source → target`);
  await copyWorkouts(db);
  await copyExerciseHistory(db);
  await copyCustomWorkouts(db);
  await copyPublicFeed(db);
  console.log(`  └─ done`);

  console.log('\n' + '═'.repeat(60));
  if (DRY_RUN) {
    console.log('🔍  DRY RUN complete — zero writes made.');
    console.log('    If the plan looks right, run without --dry-run to execute.\n');
  } else {
    console.log('✅  Copy complete! All data is now also under cdudhane@gmail.com.');
    console.log('    • Source account (chetan.dudhane@gmail.com) left fully intact as backup.');
    console.log('    • Sign in with cdudhane@gmail.com and verify your full history.');
    console.log('    • Note: until old public-feed entries are removed, the Community tab');
    console.log('      may briefly show each workout twice. We can clean that up after you verify.\n');
  }
  process.exit(0);
}

main().catch(e => {
  console.error('\n❌  Unexpected error:', e.message);
  process.exit(1);
});
