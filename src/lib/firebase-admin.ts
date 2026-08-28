import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'demo-project';

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Gagal membaca FIREBASE_SERVICE_ACCOUNT. Pastikan format JSON benar dan lengkap.", error);
  }
}

if (!getApps().length) {
  try {
    initializeApp(
      serviceAccount
        ? {
            credential: cert(serviceAccount),
            projectId,
          }
        : process.env.GOOGLE_APPLICATION_CREDENTIALS
          ? {
              credential: applicationDefault(),
              projectId,
            }
          : { projectId }
    );
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // Fallback so getFirestore() doesn't throw
    try {
      initializeApp({ projectId: 'demo-project' });
    } catch (e) {}
  }
}

export const adminAuth = getAuth();
export const firestore = getFirestore();
