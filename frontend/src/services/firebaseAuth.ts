import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  reload,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, database } from "./firebase";

/**
 * Hook to monitor authentication state changes
 * Returns current user and loading status
 */
export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { user, loading, error };
}

/**
 * Register a new user with name, email and password
 * Also sends a verification email and initializes Realtime Database profile
 */
export async function firebaseRegister(name: string, email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (name) {
      await updateProfile(user, { displayName: name });
    }

    // Send email verification link
    try {
      await sendEmailVerification(user);
    } catch (verifErr) {
      console.warn("Auto email verification error:", verifErr);
    }

    // Initialize user in Realtime Database
    try {
      await set(ref(database, `users/${user.uid}`), {
        id: user.uid,
        name: name || user.displayName || "User",
        email: user.email,
        plan: "free",
        credits: 10,
        createdAt: new Date().toISOString(),
      });
    } catch (dbError) {
      console.warn("Could not save initial user to Realtime Database:", dbError);
    }

    const token = await user.getIdToken();
    return { user, token, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return { user: null, token: null, error: message };
  }
}

/**
 * Sign in user with email and password
 */
export async function firebaseLogin(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    return { user, token, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return { user: null, token: null, error: message };
  }
}

/**
 * Sign out the current user
 */
export async function firebaseLogout() {
  try {
    await signOut(auth);
    localStorage.removeItem("authToken");
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed";
    return { error: message };
  }
}

/**
 * Send password reset email
 */
export async function firebaseForgotPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send reset email";
    return { error: message };
  }
}

/**
 * Send email verification to current user
 */
export async function firebaseSendEmailVerification(targetUser?: User | null) {
  try {
    const u = targetUser || auth.currentUser;
    if (!u) throw new Error("No user is currently signed in.");
    await sendEmailVerification(u);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send verification email";
    return { error: message };
  }
}

/**
 * Reload user profile from Firebase to refresh emailVerified status
 */
export async function firebaseReloadUser() {
  try {
    if (!auth.currentUser) return null;
    await reload(auth.currentUser);
    return auth.currentUser;
  } catch (error) {
    console.error("Failed to reload user:", error);
    return null;
  }
}

/**
 * Get current user's ID token
 * Used for authenticated API requests
 */
export async function getAuthToken() {
  try {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}


