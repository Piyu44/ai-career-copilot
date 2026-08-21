import admin from "firebase-admin";

let firebaseApp;

/**
 * Initialize Firebase Admin SDK
 * Supports both service account key (env vars) and default credentials
 */
export async function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const databaseURL = process.env.FIREBASE_DATABASE_URL;

    if (!projectId || !privateKey || !clientEmail || !databaseURL) {
      throw new Error(
        "Missing Firebase environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_DATABASE_URL"
      );
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
      databaseURL,
    });

    console.log(`✅ Firebase initialized: ${projectId}`);
    return firebaseApp;
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err.message);
    process.exit(1);
  }
}

/**
 * Get Realtime Database reference
 */
export function getDatabase() {
  if (!firebaseApp) {
    throw new Error("Firebase not initialized. Call initializeFirebase() first.");
  }
  return admin.database();
}

/**
 * Get Firebase Auth instance
 */
export function getAuth() {
  if (!firebaseApp) {
    throw new Error("Firebase not initialized. Call initializeFirebase() first.");
  }
  return admin.auth();
}

export default firebaseApp;
