import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

try {
  initializeApp({ projectId: 'demo-project' });
  const db = getFirestore();
  console.log("Firestore initialized successfully");
} catch (e) {
  console.error("Firestore error:", e);
}
