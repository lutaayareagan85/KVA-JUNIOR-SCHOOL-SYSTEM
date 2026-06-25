import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID from config if present, fallback to default
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Unified document reference for KVA school database master state
export const SYNC_DOC_REF = doc(db, 'kva_portal', 'master_state');

/**
 * Saves consolidated state to Cloud Firestore
 */
export async function savePortalStateToFirebase(state: any, updatedBy: string) {
  const payload = {
    state,
    timestamp: new Date().toISOString(),
    updatedBy: updatedBy || 'Staff Member'
  };
  await setDoc(SYNC_DOC_REF, payload);
  return payload;
}

/**
 * Fetches consolidated state from Cloud Firestore
 */
export async function loadPortalStateFromFirebase() {
  const docSnap = await getDoc(SYNC_DOC_REF);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}
