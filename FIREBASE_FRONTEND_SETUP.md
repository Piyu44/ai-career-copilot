# 🔥 Firebase Web SDK Setup Guide (Frontend)

## ⚠️ IMPORTANT: Two Different Firebase Setups

You have **TWO separate Firebase configurations**:

### 1. **Backend** (Server-side)
- Uses **Firebase Admin SDK** (Node.js)
- For database operations, user management, payments
- Private service account key (NEVER expose to frontend)
- I created this in the previous migration

### 2. **Frontend** (Client-side) ← YOU'RE HERE NOW
- Uses **Firebase Web SDK** (JavaScript/React)
- For client-side authentication, real-time updates
- Public API key (safe to expose)
- You just got this config

---

## 📊 Quick Comparison

| Feature | Backend | Frontend |
|---------|---------|----------|
| **SDK** | firebase-admin | firebase |
| **Config** | Service account JSON | Web config |
| **API Key** | Private (secret) | Public (OK to expose) |
| **Use for** | Database CRUD | Auth, real-time sync |
| **Location** | Node.js backend | React/Vue frontend |

---

## ✅ What You Provided

Your Firebase Web Config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDbhmQaGmtnDakP68DNfdlQvbWVc5tnZ_I",
  authDomain: "airesume-9a8b5.firebaseapp.com",
  projectId: "airesume-9a8b5",
  storageBucket: "airesume-9a8b5.firebasestorage.app",
  messagingSenderId: "714277782015",
  appId: "1:714277782015:web:ea389cab76307cc0f6e7ca",
  measurementId: "G-4X68JQ3H79"
};
```

**Status:** ✅ Valid Firebase Web Config
**Project:** `airesume-9a8b5`
**Safe to commit to git:** ✅ Yes (it's public)

---

## 🚀 Setup Instructions

### Step 1: Install Firebase Web SDK
```bash
cd frontend
npm install firebase
```

### Step 2: Create Firebase Config File
Create `frontend/src/config/firebase.js`:

```javascript
// Import Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your Firebase Web Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbhmQaGmtnDakP68DNfdlQvbWVc5tnZ_I",
  authDomain: "airesume-9a8b5.firebaseapp.com",
  projectId: "airesume-9a8b5",
  storageBucket: "airesume-9a8b5.firebasestorage.app",
  messagingSenderId: "714277782015",
  appId: "1:714277782015:web:ea389cab76307cc0f6e7ca",
  databaseURL: "https://airesume-9a8b5.firebaseio.com", // Add this!
  measurementId: "G-4X68JQ3H79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services you'll use
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
```

### Step 3: Create Firebase Hooks (Optional but Recommended)

Create `frontend/src/hooks/useFirebaseAuth.js`:

```javascript
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useFirebaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```

### Step 4: Update .env (Frontend)

Create `frontend/.env` (copy from `.env.example`):

```
VITE_FIREBASE_API_KEY=AIzaSyDbhmQaGmtnDakP68DNfdlQvbWVc5tnZ_I
VITE_FIREBASE_AUTH_DOMAIN=airesume-9a8b5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=airesume-9a8b5
VITE_FIREBASE_STORAGE_BUCKET=airesume-9a8b5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=714277782015
VITE_FIREBASE_APP_ID=1:714277782015:web:ea389cab76307cc0f6e7ca
VITE_FIREBASE_DATABASE_URL=https://airesume-9a8b5.firebaseio.com
VITE_FIREBASE_MEASUREMENT_ID=G-4X68JQ3H79
```

Then update `frontend/src/config/firebase.js` to use env variables:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
```

### Step 5: Update Frontend .env.example

Edit `frontend/.env.example`:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_DATABASE_URL=your-database-url
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_API_URL=http://localhost:5000/api
```

---

## 💡 What Frontend Firebase Can Do

✅ **Authentication**
- Sign up with email/password
- Sign in
- Password reset
- Sign out
- Persistent login (auto-login on page reload)

✅ **Real-time Database** (Optional)
- Listen to data changes in real-time
- Useful for live notifications

✅ **Storage** (Optional)
- Upload files (resumes, etc.)
- Download files

✅ **Analytics** (Included)
- Track user behavior

---

## 🔗 Frontend → Backend Communication

### Architecture

```
Frontend (React)
    ↓
    ├─ Firebase Web SDK (for auth/real-time)
    │   └─ Used for: Login state, real-time features
    │
    └─ HTTP Requests with JWT
        └─ Backend API (:5000)
            ↓
            Firebase Admin SDK
            └─ Used for: Database operations, payments, etc.
```

### Example: User Registration

```javascript
// frontend/src/pages/Register.jsx
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export function Register() {
  const handleRegister = async (email, password) => {
    try {
      // Step 1: Firebase Web SDK creates auth user (frontend only)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // Step 2: Get ID token
      const token = await userCredential.user.getIdToken();
      
      // Step 3: Send to backend API
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      // Store JWT from backend
      localStorage.setItem("token", data.token);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return <form onSubmit={handleRegister}>...</form>;
}
```

---

## 📝 Usage Examples

### Example 1: Login & Store Token

```javascript
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const token = await user.getIdToken();
  
  // Store token for API calls
  localStorage.setItem("authToken", token);
  
  return user;
}
```

### Example 2: Protected API Call

```javascript
export async function fetchUserProfile() {
  const token = localStorage.getItem("authToken");
  
  const response = await fetch("http://localhost:5000/api/auth/me", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

### Example 3: Listen to Auth State

```javascript
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User logged in:", user.email);
    } else {
      console.log("User logged out");
    }
  });

  return unsubscribe;
}, []);
```

### Example 4: Logout

```javascript
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export async function logout() {
  await signOut(auth);
  localStorage.removeItem("authToken");
}
```

---

## 🔒 Security Best Practices

### 1. Never expose private keys
```javascript
// ❌ WRONG - This is a private key, never expose it
const adminKey = "-----BEGIN PRIVATE KEY-----...";

// ✅ RIGHT - Public API key is fine to expose
const publicKey = "AIzaSyDbhmQaGmtnDakP68DNfdlQvbWVc5tnZ_I";
```

### 2. Store sensitive data securely
```javascript
// ❌ WRONG
localStorage.setItem("password", password);

// ✅ RIGHT
localStorage.setItem("authToken", token); // JWT only
```

### 3. Use environment variables for all keys
```javascript
// ✅ RIGHT
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

---

## ✅ Checklist

- [ ] Install Firebase Web SDK: `npm install firebase`
- [ ] Create `frontend/src/config/firebase.js`
- [ ] Add Firebase config (your provided config)
- [ ] Create `frontend/.env`
- [ ] Update `frontend/.env.example`
- [ ] Test Firebase initialization
- [ ] Create auth hooks (optional)
- [ ] Test login/registration

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'firebase'"
```bash
npm install firebase
```

### Error: "databaseURL is missing"
Add to firebase.js:
```javascript
databaseURL: "https://airesume-9a8b5.firebaseio.com",
```

### Authentication not working
Make sure in Firebase Console:
1. Go to Authentication → Sign-in method
2. Email/Password is enabled
3. Users exist in Users tab

### Real-time updates not working
Make sure in Firebase Console:
1. Go to Realtime Database → Rules
2. Rules allow read/write for authenticated users

---

## 📚 Next Steps

1. ✅ Add Firebase Web SDK to frontend
2. ✅ Create authentication screens
3. ✅ Connect to backend API
4. ✅ Test end-to-end flow

---

## 📞 Related Guides

- Backend Firebase: `COMPLETE_EXECUTION_PLAN.md`
- Architecture: `FIREBASE_ARCHITECTURE.md`
- Quick Reference: `FIREBASE_QUICK_REFERENCE.md`

---

**Your Firebase project is ready!** 🎉
