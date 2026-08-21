# 🔥 Firebase Complete Setup - Frontend + Backend

Complete guide to set up Firebase for both frontend and backend of your AI Career Copilot.

---

## 📊 Overview

You have **two Firebase setups**:

### 1. **Backend** (Node.js)
```
Backend Express Server
    ↓
Firebase Admin SDK (Node.js)
    ↓
Firebase Realtime Database (data storage)
```

### 2. **Frontend** (React/Vite)
```
React App
    ↓
Firebase Web SDK (JavaScript)
    ↓
Firebase Authentication (user login)
Firebase Realtime DB (real-time updates)
```

---

## 🎯 Your Firebase Credentials

### Project Details
```
Project Name: airesume-9a8b5
Project ID: airesume-9a8b5
Auth Domain: airesume-9a8b5.firebaseapp.com
Database URL: https://airesume-9a8b5.firebaseio.com
Storage Bucket: airesume-9a8b5.firebasestorage.app
```

### Web SDK Configuration (Public - Safe to commit)
```javascript
{
  apiKey: "AIzaSyDbhmQaGmtnDakP68DNfdlQvbWVc5tnZ_I",
  authDomain: "airesume-9a8b5.firebaseapp.com",
  projectId: "airesume-9a8b5",
  storageBucket: "airesume-9a8b5.firebasestorage.app",
  messagingSenderId: "714277782015",
  appId: "1:714277782015:web:ea389cab76307cc0f6e7ca",
  measurementId: "G-4X68JQ3H79"
}
```

### Backend Admin SDK Configuration (Private - Never commit)
You need to get this from Firebase Console:
1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Extract these 3 fields:
   - `project_id`
   - `private_key`
   - `client_email`

---

## 🚀 Setup Instructions

### Step 1: Frontend Setup (30 minutes)

**1A. Install Firebase SDK**
```bash
cd frontend
npm install firebase
```

**1B. Create Firebase Config**
Already done! File: `frontend/src/services/firebase.ts`

**1C. Create .env file**
```bash
cd frontend
cp .env.example .env
```

The `.env` file already contains your Firebase Web configuration.

**1D. Test Firebase**
```typescript
// In your main component
import app from "./services/firebase";
console.log("Firebase initialized:", app.name); // Should print "firebase"
```

---

### Step 2: Backend Setup (1-2 hours)

**2A. Install Firebase Admin SDK**
```bash
cd backend
npm install firebase-admin
```

**2B. Create .env File**
```bash
cd backend
cp .env.firebase.example .env
```

**2C. Get Service Account Key**
1. Go to Firebase Console
2. Project Settings → Service Accounts tab
3. Click "Generate New Private Key"
4. Download JSON file
5. Open it and extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

**2D. Update .env**
```
FIREBASE_PROJECT_ID=airesume-9a8b5
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@airesume-9a8b5.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://airesume-9a8b5.firebaseio.com
```

**2E. Update server.js**
```bash
# Backup old server
mv backend/server.js backend/server-mongodb.js

# Use Firebase version
cp backend/server-firebase.js backend/server.js
```

**2F. Update Controllers**
Replace imports in all controllers:
```javascript
// OLD
import User from "../models/User.js";

// NEW
import { FirebaseUser } from "../services/firebaseUser.js";
```

---

### Step 3: Set Up Firebase Console

**3A. Enable Authentication**
1. Firebase Console → Authentication
2. Sign-in method → Email/Password → Enable
3. Save

**3B. Create Realtime Database**
1. Firebase Console → Realtime Database
2. Click "Create Database"
3. Choose region (closest to users)
4. Start in **Test Mode**
5. Enable

**3C. Set Security Rules**
1. Go to Realtime Database → Rules
2. Paste rules from `FIREBASE_MIGRATION_GUIDE.md`
3. Publish

---

## 🔄 How They Work Together

### User Registration Flow

```
1. User fills registration form (Frontend)
   ↓
2. Frontend calls firebaseRegister(email, password)
   ├─ Firebase Web SDK creates auth user
   ├─ Gets JWT token from Firebase
   └─ Stores token in localStorage
   ↓
3. Frontend sends token + data to Backend
   POST /api/auth/register
   Header: Authorization: Bearer TOKEN
   ↓
4. Backend receives request
   ├─ Verifies JWT token
   ├─ Firebase Admin SDK writes user to database
   └─ Returns JWT + user data
   ↓
5. Frontend stores JWT token
   ├─ Redirects to dashboard
   └─ Uses token for all API calls
```

### Authenticated API Call Flow

```
Frontend Component
    ↓
getAuthToken() → Gets token from Firebase
    ↓
fetch("/api/endpoint", {
  headers: { "Authorization": "Bearer TOKEN" }
})
    ↓
Backend Middleware
    ├─ Verifies JWT token
    ├─ Extracts userId
    └─ Calls controller
    ↓
Controller
    ├─ Firebase Admin SDK queries database
    ├─ Returns data
    └─ Response sent to frontend
```

---

## 📝 Files Checklist

### Backend Files Created
- ✅ `config/firebase.js` - Firebase initialization
- ✅ `services/firebaseUser.js` - User adapter
- ✅ `services/firebaseResume.js` - Resume adapter
- ✅ `services/firebaseModels.js` - Subscription, Application, Usage
- ✅ `services/firebaseUtils.js` - Utilities
- ✅ `controllers/authController-firebase.js` - Example auth
- ✅ `server-firebase.js` - New server file
- ✅ `.env.firebase.example` - Backend env template

### Frontend Files Created
- ✅ `src/services/firebase.ts` - Firebase initialization
- ✅ `src/services/firebaseAuth.ts` - Auth functions & hooks
- ✅ `.env.example` - Updated with Firebase vars
- ✅ `FIREBASE_FRONTEND_QUICK_START.md` - Quick reference

### Documentation Files
- ✅ `FIREBASE_MIGRATION_GUIDE.md` - Backend guide
- ✅ `FIREBASE_IMPLEMENTATION_GUIDE.md` - Code patterns
- ✅ `FIREBASE_QUICK_REFERENCE.md` - API reference
- ✅ `FIREBASE_FRONTEND_SETUP.md` - Frontend guide
- ✅ `COMPLETE_EXECUTION_PLAN.md` - Step-by-step
- ✅ `FIREBASE_ARCHITECTURE.md` - Diagrams
- ✅ `FIREBASE_COMPLETE_SETUP.md` - This file

---

## 🧪 Testing

### Step 1: Start Backend
```bash
cd backend
npm run dev
# Should see: ✅ Firebase initialized: airesume-9a8b5
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
# Should see: Firebase initialized: firebase
```

### Step 3: Test Registration (cURL)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Step 4: Verify in Firebase Console
1. Go to Firebase Console
2. Realtime Database
3. You should see:
```
users/
  auto-generated-id/
    name: "Test User"
    email: "test@example.com"
    credits: 10
```

### Step 5: Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### Step 6: Test Frontend Login
In your React component:
```typescript
import { firebaseLogin } from "./services/firebaseAuth";

const { user, token, error } = await firebaseLogin(
  "test@example.com",
  "TestPassword123"
);

if (token) {
  localStorage.setItem("authToken", token);
  console.log("✅ Logged in:", user.email);
}
```

---

## 🔒 Security Checklist

- [ ] Backend `.env` is in `.gitignore`
- [ ] Frontend `.env` is in `.gitignore`
- [ ] Never commit service account keys
- [ ] Frontend `.env.example` has no real keys
- [ ] Backend `.env.example` has no real keys
- [ ] Firebase security rules are published
- [ ] Passwords are hashed on backend
- [ ] JWTs are used for API authentication
- [ ] HTTPS is used in production

---

## ⚡ Quick Reference

### Frontend - Register User
```typescript
import { firebaseRegister } from "./services/firebaseAuth";

const { user, token, error } = await firebaseRegister(email, password);
if (token) localStorage.setItem("authToken", token);
```

### Frontend - Login User
```typescript
import { firebaseLogin } from "./services/firebaseAuth";

const { user, token, error } = await firebaseLogin(email, password);
if (token) localStorage.setItem("authToken", token);
```

### Frontend - Get Current User
```typescript
import { useFirebaseAuth } from "./services/firebaseAuth";

const { user, loading } = useFirebaseAuth();
```

### Backend - Get User
```typescript
import { FirebaseUser } from "../services/firebaseUser.js";

const user = await FirebaseUser.findById(userId);
```

### Backend - Create User
```typescript
const user = await FirebaseUser.create({
  name,
  email,
  passwordHash: password,
});
```

---

## 📚 Documentation Guide

| Document | Purpose | Read When |
|----------|---------|-----------|
| **FIREBASE_COMPLETE_SETUP.md** | Overview & integration | First |
| **FIREBASE_FRONTEND_QUICK_START.md** | Frontend quick start | Setting up React |
| **COMPLETE_EXECUTION_PLAN.md** | Backend step-by-step | Setting up backend |
| **FIREBASE_MIGRATION_GUIDE.md** | Detailed backend guide | Need details |
| **FIREBASE_IMPLEMENTATION_GUIDE.md** | Code patterns | Converting controllers |
| **FIREBASE_ARCHITECTURE.md** | System design | Understanding flow |
| **FIREBASE_QUICK_REFERENCE.md** | API reference | Using APIs |

---

## 🆘 Troubleshooting

### Frontend Firebase not initializing
```
Error: "Cannot find module 'firebase'"
```
Solution:
```bash
npm install firebase
```

### Backend Firebase not initializing
```
Error: "Cannot find module 'firebase-admin'"
```
Solution:
```bash
npm install firebase-admin
```

### Auth not working
- Make sure Authentication is enabled in Firebase Console
- Make sure Email/Password provider is enabled
- Check security rules allow authentication

### API calls failing with 401
- Make sure JWT token is being sent
- Check `Authorization: Bearer TOKEN` header
- Verify backend JWT_SECRET matches

### Data not appearing in Firebase
- Check security rules allow writes
- Check userId is being saved correctly
- Verify `.indexOn` rules for query fields

---

## 🎯 Success Checklist

- [ ] Backend Firebase Admin SDK initialized
- [ ] Frontend Firebase Web SDK initialized
- [ ] Authentication enabled in Firebase Console
- [ ] Realtime Database created
- [ ] Security rules published
- [ ] Backend server starts without errors
- [ ] Frontend app loads without errors
- [ ] Can register new user
- [ ] User appears in Firebase Console
- [ ] Can login existing user
- [ ] Can fetch user data from API
- [ ] Tokens stored and used correctly
- [ ] All endpoints tested
- [ ] Ready for deployment

---

## 🚀 Next Steps

1. **Right now:**
   - Read this document
   - Understand the architecture

2. **Next 30 minutes:**
   - Set up Firebase Console
   - Get service account key

3. **Next 1-2 hours:**
   - Frontend: Install Firebase, test auth
   - Backend: Install firebase-admin, update controllers

4. **Next 30 minutes:**
   - Test registration & login
   - Verify data in Firebase Console

5. **Final:**
   - Set security rules
   - Deploy to production

---

## 📞 Need Help?

- **Quick questions?** → See FIREBASE_QUICK_REFERENCE.md
- **Frontend help?** → See FIREBASE_FRONTEND_SETUP.md
- **Backend help?** → See FIREBASE_MIGRATION_GUIDE.md
- **Code patterns?** → See FIREBASE_IMPLEMENTATION_GUIDE.md
- **Architecture?** → See FIREBASE_ARCHITECTURE.md
- **Step-by-step?** → See COMPLETE_EXECUTION_PLAN.md

---

## ✨ You're All Set!

Everything is ready. Follow the guides and you'll have a complete Firebase setup in 2-4 hours.

**Good luck! 🚀**

---

*Firebase Complete Setup Guide v1.0*
*For AI Career Copilot Backend + Frontend*
