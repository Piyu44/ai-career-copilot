# Firebase Realtime Database Migration Guide

Complete step-by-step guide to migrate from MongoDB to Firebase Realtime Database.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter your project name (e.g., "ai-career-copilot")
4. Choose your region
5. Click **"Create project"** and wait for provisioning

## Step 2: Enable Authentication & Realtime Database

### Enable Authentication:
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Optionally enable Google, GitHub, etc.

### Create Realtime Database:
1. Go to **Realtime Database** (in left sidebar under "Build")
2. Click **"Create Database"**
3. Choose your location (closest to your users)
4. Start in **Test Mode** (you'll secure it later with rules)
5. Click **"Enable"**

## Step 3: Get Firebase Configuration

1. Go to **Project Settings** (⚙️ icon in top-left)
2. Click **"Service accounts"** tab
3. Click **"Generate new private key"** button
4. Save the JSON file (keep it private!)
5. Copy the Web API configuration from "General" tab

## Step 4: Set Up Node.js Firebase Admin SDK

### Install Dependencies:
```bash
npm install firebase-admin
```

### Create Firebase Config File:
Create `backend/config/firebase.js` with your service account credentials.

## Step 5: Update Environment Variables

Update your `.env` file:
```
# Remove MongoDB
# MONGODB_URI=...

# Add Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key (from JSON file)
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

## Step 6: Database Structure in Firebase

```
users/
  {userId}
    name: string
    email: string
    passwordHash: string
    plan: string
    credits: number
    resetToken: string (optional)
    resetExpires: timestamp (optional)
    createdAt: timestamp
    updatedAt: timestamp

resumes/
  {resumeId}
    userId: string
    name: string
    fileName: string
    mimeType: string
    sizeBytes: number
    storageKey: string
    extractedText: string
    isMaster: boolean
    createdAt: timestamp
    updatedAt: timestamp

applications/
  {applicationId}
    userId: string
    jobId: string
    status: string
    appliedAt: timestamp
    ...

subscriptions/
  {subscriptionId}
    userId: string
    plan: string
    renewalDate: timestamp
    ...

interviews/
  {interviewId}
    userId: string
    title: string
    ...

coverLetters/
  {letterId}
    userId: string
    content: string
    ...

jobAnalyses/
  {analysisId}
    userId: string
    analysis: object
    ...

usage/
  {usageId}
    userId: string
    creditsUsed: number
    ...
```

## Step 7: Firebase Security Rules

Update your **Realtime Database Rules**:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth.uid === $uid",
        ".write": "auth.uid === $uid",
        "passwordHash": { ".read": false },
        "resetToken": { ".read": false },
        "resetExpires": { ".read": false }
      }
    },
    "resumes": {
      "$resumeId": {
        ".read": "root.child('users').child(auth.uid).exists()",
        ".write": "root.child('resumes').child($resumeId).child('userId').val() === auth.uid"
      }
    },
    "applications": {
      "$appId": {
        ".read": "root.child('applications').child($appId).child('userId').val() === auth.uid",
        ".write": "root.child('applications').child($appId).child('userId').val() === auth.uid"
      }
    },
    "subscriptions": {
      "$subId": {
        ".read": "root.child('subscriptions').child($subId).child('userId').val() === auth.uid",
        ".write": false
      }
    },
    "interviews": {
      "$intId": {
        ".read": "root.child('interviews').child($intId).child('userId').val() === auth.uid",
        ".write": "root.child('interviews').child($intId).child('userId').val() === auth.uid"
      }
    },
    "coverLetters": {
      "$letterId": {
        ".read": "root.child('coverLetters').child($letterId).child('userId').val() === auth.uid",
        ".write": "root.child('coverLetters').child($letterId).child('userId').val() === auth.uid"
      }
    },
    "jobAnalyses": {
      "$analysisId": {
        ".read": "root.child('jobAnalyses').child($analysisId).child('userId').val() === auth.uid",
        ".write": "root.child('jobAnalyses').child($analysisId).child('userId').val() === auth.uid"
      }
    },
    "usage": {
      "$usageId": {
        ".read": "root.child('usage').child($usageId).child('userId').val() === auth.uid",
        ".write": false
      }
    }
  }
}
```

## Step 8: Deploy & Test

1. Update your backend code with Firebase implementations
2. Test locally with Firebase Emulator Suite (optional)
3. Deploy to production

---

## Key Differences from MongoDB

| MongoDB | Firebase Realtime DB |
|---------|----------------------|
| Schema validation | Manual validation |
| Transactions | Limited (single location) |
| Complex queries | Simpler queries, post-filter |
| Scalability | Auto-scales |
| Pricing | Pay per operation |
| Learning curve | Different paradigm |

## Pricing Comparison

Firebase is cheaper for small-scale apps but more expensive at scale compared to MongoDB Atlas.

---

## Next Steps

1. ✅ Set up Firebase project (Steps 1-3)
2. ✅ Install firebase-admin SDK (Step 4)
3. ✅ Update environment variables (Step 5)
4. ✅ Update your backend models (use provided adapter files)
5. ✅ Update your controllers (use provided updated versions)
6. ✅ Set security rules (Step 7)
7. ✅ Test thoroughly before production
