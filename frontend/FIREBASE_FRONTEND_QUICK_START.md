# 🚀 Frontend Firebase Setup - Quick Start

## ✅ What Was Added

```
frontend/
├── src/
│   ├── services/
│   │   ├── firebase.ts          ← Firebase initialization
│   │   └── firebaseAuth.ts      ← Auth hooks & functions
│   └── ...
└── .env.example                 ← Updated with Firebase vars
```

---

## 📦 Install Dependencies

```bash
cd frontend
npm install firebase
```

---

## 🔑 Your Firebase Configuration

Your project credentials are already in the files:
```javascript
Project ID: airesume-9a8b5
Auth Domain: airesume-9a8b5.firebaseapp.com
Database URL: https://airesume-9a8b5.firebaseio.com
API Key: AIzaSyDbhmQaGmtnDakP68DNfdlQvbWVc5tnZ_I
```

**Safe to commit:** ✅ Yes (it's the public Web SDK key)

---

## 🎯 Quick Usage Examples

### Example 1: Register a New User

```typescript
// In your Register.tsx component
import { firebaseRegister } from "../services/firebaseAuth";

export function Register() {
  const handleRegister = async (email: string, password: string) => {
    const { user, token, error } = await firebaseRegister(email, password);
    
    if (error) {
      console.error("Registration failed:", error);
      return;
    }
    
    // Store JWT token for API calls
    localStorage.setItem("authToken", token);
    console.log("Registered:", user?.email);
  };

  return <form onSubmit={() => handleRegister("user@example.com", "password123")} />;
}
```

### Example 2: Login User

```typescript
// In your Login.tsx component
import { firebaseLogin } from "../services/firebaseAuth";

export function Login() {
  const handleLogin = async (email: string, password: string) => {
    const { user, token, error } = await firebaseLogin(email, password);
    
    if (error) {
      console.error("Login failed:", error);
      return;
    }
    
    // Store JWT token
    localStorage.setItem("authToken", token);
    console.log("Logged in:", user?.email);
    
    // Redirect to dashboard
    window.location.href = "/dashboard";
  };

  return <form onSubmit={() => handleLogin("user@example.com", "password123")} />;
}
```

### Example 3: Check User Auth State

```typescript
// In your App.tsx or layout component
import { useFirebaseAuth } from "../services/firebaseAuth";

export function App() {
  const { user, loading, error } = useFirebaseAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {user ? (
        <div>
          Welcome, {user.email}!
          <button onClick={() => logout()}>Logout</button>
        </div>
      ) : (
        <div>
          <a href="/login">Login</a> | <a href="/register">Register</a>
        </div>
      )}
    </div>
  );
}
```

### Example 4: Make Authenticated API Call

```typescript
// Fetch user profile from backend
import { getAuthToken } from "../services/firebaseAuth";

export async function fetchUserProfile() {
  const token = await getAuthToken();
  
  if (!token) {
    console.error("Not authenticated");
    return null;
  }

  const response = await fetch("http://localhost:5000/api/auth/me", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return response.json();
}
```

### Example 5: Logout

```typescript
import { firebaseLogout } from "../services/firebaseAuth";

export function Logout() {
  const handleLogout = async () => {
    const { error } = await firebaseLogout();
    
    if (error) {
      console.error("Logout failed:", error);
      return;
    }
    
    // Redirect to home
    window.location.href = "/";
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## 🔗 How Frontend & Backend Work Together

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (React)                           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  User Types Email & Password                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↓                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  firebaseRegister(email, password)                     │ │
│  │  - Creates Firebase auth user                          │ │
│  │  - Gets ID token from Firebase                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↓                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  localStorage.setItem("authToken", token)              │ │
│  │  - Stores token for future API calls                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                        ↓ HTTP Request
        POST /api/auth/register (with token header)
                        ↓
┌──────────────────────────────────────────────────────────────┐
│               Backend (Node.js Express)                       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Verify JWT token from header                          │ │
│  │  - Extract userId from token                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↓                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Create user in Firebase Realtime Database             │ │
│  │  - Name, email, password hash                          │ │
│  │  - Credits, plan info                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                        ↓                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Return JWT + user data                                │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                        ↓ HTTP Response
            {"token": "...", "user": {...}}
                        ↓
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (React)                           │
│                                                               │
│  ✅ User logged in successfully!                            │
│  ✅ Token stored in localStorage                            │
│  ✅ Redirect to dashboard                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Integration Checklist

- [ ] Run `npm install firebase`
- [ ] Firebase config files created:
  - [ ] `frontend/src/services/firebase.ts`
  - [ ] `frontend/src/services/firebaseAuth.ts`
- [ ] `.env.example` updated with Firebase variables
- [ ] Create `.env` file (copy from `.env.example`)
- [ ] Test Firebase initialization:
  ```typescript
  import app from "./services/firebase";
  console.log("Firebase initialized:", app.name);
  ```
- [ ] Test authentication:
  ```typescript
  import { firebaseRegister } from "./services/firebaseAuth";
  // Try registering a test user
  ```

---

## 🔐 Security Notes

✅ **Your API Key is public** - It's designed to be exposed in the browser
✅ **Never expose private keys** - Those go in backend `.env` only
✅ **Store tokens securely** - localStorage is OK for dev, use secure cookies for production
✅ **Always validate on backend** - Never trust frontend authentication alone

---

## 🆘 Common Issues

### Error: "Cannot find module 'firebase'"
```bash
npm install firebase
```

### Error: "databaseURL is missing"
Already added in `firebase.ts` - should work!

### Error: "User does not exist"
Make sure in Firebase Console:
- Authentication → Sign-in method → Email/Password is enabled
- Create test user manually if needed

### Token not working with backend
Make sure backend has:
- Firebase Admin SDK initialized
- JWT_SECRET configured in .env
- Proper security rules in Realtime Database

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `firebase.ts` | Firebase initialization & exports |
| `firebaseAuth.ts` | Auth functions & hooks |
| `.env.example` | Environment template |
| `.env` | Your actual secrets (git ignored) |

---

## 🚀 Next Steps

1. ✅ `npm install firebase`
2. ✅ Create `.env` file with Firebase vars
3. ✅ Test in a component
4. ✅ Connect to backend API
5. ✅ Test end-to-end flow

---

## 📞 Related Guides

- **Backend Setup:** `COMPLETE_EXECUTION_PLAN.md`
- **Architecture:** `FIREBASE_ARCHITECTURE.md`
- **Full Frontend Guide:** `FIREBASE_FRONTEND_SETUP.md`

---

**Frontend Firebase is ready!** 🎉
