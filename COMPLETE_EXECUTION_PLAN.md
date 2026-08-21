# 🚀 Firebase Migration - Complete Execution Plan

This is your step-by-step guide to migrate from MongoDB to Firebase Realtime Database.

---

## Phase 1: Firebase Project Setup (30 mins)

### Step 1.1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Enter project name: `ai-career-copilot` (or your choice)
4. Accept the terms and create

### Step 1.2: Enable Firebase Services

**Enable Realtime Database:**
1. Left sidebar → **Build** → **Realtime Database**
2. Click **"Create Database"**
3. Select region closest to your users
4. Start in **Test Mode** (we'll secure it later)
5. Click **Enable**

**Enable Authentication:**
1. Left sidebar → **Build** → **Authentication**
2. Click **Sign-in method** tab
3. Enable **Email/Password**
4. Save

### Step 1.3: Get Service Account Credentials
1. Click ⚙️ (Settings) in top-left
2. Go to **Service accounts** tab
3. Click **"Generate new private key"**
4. Save the JSON file (keep it secret!)

**Extract these from the JSON file:**
- `project_id` → FIREBASE_PROJECT_ID
- `private_key` → FIREBASE_PRIVATE_KEY
- `client_email` → FIREBASE_CLIENT_EMAIL

**Get Database URL:**
1. Go back to **Realtime Database**
2. Copy the URL (e.g., https://your-project-id.firebaseio.com)
3. This is FIREBASE_DATABASE_URL

---

## Phase 2: Update Your Code (1-2 hours)

### Step 2.1: Install Dependencies
```bash
cd backend
npm install firebase-admin
```

### Step 2.2: Update Environment Variables
1. Copy template: `cp .env.firebase.example .env`
2. Open `.env` and fill in your Firebase credentials:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=service-account@project-id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

### Step 2.3: Update Entry Point
```bash
# Backup your old server
mv backend/server.js backend/server-mongodb.js

# Use Firebase version
cp backend/server-firebase.js backend/server.js
```

### Step 2.4: Update Controllers One by One

**Option A: Use provided examples (fastest)**
- Replace `backend/controllers/authController.js` with content from `authController-firebase.js`
- Follow the patterns in `FIREBASE_IMPLEMENTATION_GUIDE.md` for other controllers

**Option B: Convert manually (thorough)**
Follow this pattern for each controller:

```javascript
// BEFORE (Mongoose)
import User from "../models/User.js";
const user = await User.findOne({ email });

// AFTER (Firebase)
import { FirebaseUser } from "../services/firebaseUser.js";
const user = await FirebaseUser.findOne({ email });
```

### Step 2.5: Update Other Imports

Check these files and update imports:
- `middleware/auth.js` - if it imports User model
- `routes/authRoutes.js` - if it imports User model
- `controllers/*.js` - all controllers using Resume, User, etc.

---

## Phase 3: Testing (1 hour)

### Step 3.1: Start Your Server
```bash
cd backend
npm run dev
# Should see: ✅ AI Career Copilot API listening on :5000 (Firebase Realtime DB)
```

### Step 3.2: Test Authentication

**Test Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

**Expected response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user123",
    "name": "Test User",
    "email": "test@example.com",
    "plan": "free",
    "credits": 10
  }
}
```

**Test Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

**Test Protected Route:**
```bash
# Replace YOUR_JWT with the token from register/login
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT"
```

### Step 3.3: Check Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project
3. Go to **Realtime Database**
4. You should see:
   ```
   users/
     {auto-generated-id}/
       name: "Test User"
       email: "test@example.com"
       plan: "free"
       credits: 10
   ```

### Step 3.4: Test Resume Upload (if you have it implemented)
Run your full test suite and verify all endpoints work.

---

## Phase 4: Security (30 mins)

### Step 4.1: Set Firebase Security Rules

1. Go to **Realtime Database** → **Rules** tab
2. Replace the default rules with proper security rules
3. Use the rules from `FIREBASE_MIGRATION_GUIDE.md` Security Rules section
4. Click **Publish**

### Step 4.2: Enable Indexing

1. In the **Rules** editor, Firebase will suggest indexes for your queries
2. Click the index creation links
3. Confirm in the **Indexes** tab

### Step 4.3: Rotate Secrets

1. In Firebase Console → **Settings** → **Service accounts**
2. Disable/delete the old private key
3. Generate a new one if needed
4. Update your `.env`

---

## Phase 5: Migration (1-2 hours)

### Option A: Fresh Start (Recommended for new projects)
Just use Firebase with your new app.

### Option B: Migrate Existing MongoDB Data

**Step 1:** Export MongoDB data
```bash
# Export users collection to JSON
mongoexport --uri="your-mongodb-uri" \
  --collection=users \
  --out=users.json
```

**Step 2:** Write migration script
Create `backend/scripts/migrate-from-mongodb.js`:

```javascript
import { initializeFirebase, getDatabase } from "../config/firebase.js";
import fs from "fs";

async function migrateUsers() {
  await initializeFirebase();
  const db = getDatabase();
  
  const users = JSON.parse(fs.readFileSync("users.json"));
  const updates = {};
  
  for (const user of users) {
    updates[`users/${user._id}`] = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      plan: user.plan,
      credits: user.credits,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
  
  await db.ref().update(updates);
  console.log("✅ Migration complete!");
}

migrateUsers().catch(console.error);
```

**Step 3:** Run migration
```bash
node backend/scripts/migrate-from-mongodb.js
```

---

## Phase 6: Deployment (1-2 hours)

### Step 6.1: Push to Production

```bash
git add .
git commit -m "Migrate database from MongoDB to Firebase Realtime Database"
git push origin main
```

### Step 6.2: Update Environment on Hosting

**If using Vercel/Netlify:**
1. Add Firebase environment variables to your dashboard
2. Redeploy

**If using custom server:**
1. SSH into your server
2. Update `.env` with Firebase credentials
3. Restart the service: `pm2 restart api` (or your process manager)

### Step 6.3: Monitor

1. Check Firebase Console → **Realtime Database** for incoming data
2. Check server logs for any errors
3. Monitor performance dashboard

---

## 📊 Quick Status Checklist

```
PHASE 1: SETUP
  [ ] Firebase project created
  [ ] Realtime Database enabled
  [ ] Authentication enabled
  [ ] Service account key downloaded
  [ ] Environment variables ready

PHASE 2: CODE
  [ ] firebase-admin installed
  [ ] server.js updated
  [ ] .env configured
  [ ] Controllers updated
  [ ] All imports changed to Firebase adapters

PHASE 3: TESTING
  [ ] Server starts successfully
  [ ] Registration works
  [ ] Login works
  [ ] Get /me endpoint works
  [ ] Data appears in Firebase Console
  [ ] All endpoints tested

PHASE 4: SECURITY
  [ ] Security rules applied
  [ ] Indexes created
  [ ] Secrets rotated

PHASE 5: MIGRATION
  [ ] Data migrated (if applicable)
  [ ] Verified in Firebase Console

PHASE 6: PRODUCTION
  [ ] Changes pushed to git
  [ ] Environment updated on hosting
  [ ] Monitoring configured
  [ ] Team notified
```

---

## 🆘 Troubleshooting

### "Firebase not initialized"
- Check .env has all required variables
- Verify `initializeFirebase()` is called in server.js
- Check for typos in Firebase credentials

### "Permission denied" errors
- Go to Realtime Database → Rules
- Make sure your security rules allow the operation
- Start with `.read: true, .write: true` for testing, then add proper rules

### "Email already exists" not working
- Add `.indexOn: ["email"]` to users security rules
- Publish rules and wait a moment

### Data not appearing in Firebase Console
- Check server logs for errors
- Verify userId is correct
- Check security rules allow write

### Slow queries
- Avoid `.find()` without userId
- Add indexing for frequently filtered fields
- Consider Firestore if queries get too complex

---

## 📞 Support Resources

1. **Quick Reference** → `FIREBASE_QUICK_REFERENCE.md`
2. **Full Guide** → `FIREBASE_MIGRATION_GUIDE.md`
3. **Implementation Details** → `FIREBASE_IMPLEMENTATION_GUIDE.md`
4. **Code Examples** → `services/firebaseUtils.js`
5. **Firebase Docs** → https://firebase.google.com/docs/database

---

## ✅ Success Criteria

You're done when:

- ✅ Server starts with Firebase
- ✅ Can register new users
- ✅ Can login existing users
- ✅ Users appear in Firebase Console
- ✅ Security rules are applied
- ✅ All endpoints work
- ✅ No console errors
- ✅ Deployed to production

---

## 🎯 Next Steps

**Right now:**
1. Go to Firebase Console
2. Create your project
3. Download service account key
4. Update .env file

**In 30 minutes:**
1. Install firebase-admin
2. Test registration endpoint

**By end of day:**
1. Update all controllers
2. Run full test suite
3. Commit to git

**By tomorrow:**
1. Deploy to production
2. Monitor performance

---

Good luck! 🚀 Feel free to ask any questions.
