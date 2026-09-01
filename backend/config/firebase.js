import admin from "firebase-admin";

let firebaseApp = null;
const memoryStore = new Map();

/**
 * In-memory fallback DB reference for local demo / standalone execution
 */
class MemoryRef {
  constructor(path) {
    this.path = (path || "").replace(/^\/+|\/+$/g, "");
  }

  push() {
    const key = `k_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newPath = this.path ? `${this.path}/${key}` : key;
    const ref = new MemoryRef(newPath);
    ref.key = key;
    return ref;
  }

  async set(value) {
    memoryStore.set(this.path, JSON.parse(JSON.stringify(value)));
    return true;
  }

  async get() {
    const direct = memoryStore.get(this.path);
    if (direct !== undefined) {
      return {
        exists: () => true,
        val: () => direct,
      };
    }

    // Check if this path is a parent directory/collection
    const prefix = this.path ? `${this.path}/` : "";
    const matches = {};
    let found = false;

    for (const [k, v] of memoryStore.entries()) {
      if (k.startsWith(prefix)) {
        const rest = k.slice(prefix.length);
        if (rest && !rest.includes("/")) {
          matches[rest] = v;
          found = true;
        }
      }
    }

    return {
      exists: () => found,
      val: () => (found ? matches : null),
    };
  }

  async update(updates) {
    const current = (await this.get()).val() || {};
    const merged = { ...current, ...updates };
    memoryStore.set(this.path, merged);
    return true;
  }

  async remove() {
    memoryStore.delete(this.path);
    const prefix = this.path ? `${this.path}/` : "";
    for (const k of Array.from(memoryStore.keys())) {
      if (k.startsWith(prefix)) {
        memoryStore.delete(k);
      }
    }
    return true;
  }

  orderByChild(prop) {
    return {
      equalTo: (val) => ({
        limitToFirst: () => ({
          get: async () => {
            const snap = await this.get();
            if (!snap.exists()) return { exists: () => false, val: () => null };
            const all = snap.val();
            const filtered = {};
            for (const [k, item] of Object.entries(all)) {
              if (item && item[prop] === val) {
                filtered[k] = item;
                break;
              }
            }
            const has = Object.keys(filtered).length > 0;
            return { exists: () => has, val: () => (has ? filtered : null) };
          },
        }),
        get: async () => {
          const snap = await this.get();
          if (!snap.exists()) return { exists: () => false, val: () => null };
          const all = snap.val();
          const filtered = {};
          for (const [k, item] of Object.entries(all)) {
            if (item && item[prop] === val) {
              filtered[k] = item;
            }
          }
          const has = Object.keys(filtered).length > 0;
          return { exists: () => has, val: () => (has ? filtered : null) };
        },
      }),
    };
  }
}

/**
 * Initialize Firebase Admin SDK
 */
export async function initializeFirebase() {
  if (firebaseApp) return firebaseApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (projectId && privateKey && clientEmail && databaseURL) {
    try {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
        databaseURL,
      });
      console.log(`✅ Firebase Admin initialized: ${projectId}`);
      return firebaseApp;
    } catch (err) {
      console.warn("⚠️ Firebase Admin initialization failed, falling back to local memory store:", err.message);
    }
  } else {
    console.log("ℹ️  Running backend in lightweight mode (Firebase Admin env not set; using memory store).");
  }

  return null;
}

/**
 * Get Realtime Database reference
 */
export function getDatabase() {
  if (firebaseApp) {
    return admin.database();
  }
  return {
    ref: (path = "") => new MemoryRef(path),
  };
}

/**
 * Get Firebase Auth instance
 */
export function getAuth() {
  if (firebaseApp) {
    return admin.auth();
  }
  return null;
}

export default {
  initializeFirebase,
  getDatabase,
  getAuth,
};
