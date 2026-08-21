# Firebase Migration - Quick Reference

## 📋 Quick Checklist

- [ ] Create Firebase project
- [ ] Enable Authentication & Realtime Database
- [ ] Download service account key
- [ ] Install: `npm install firebase-admin`
- [ ] Update `.env` with Firebase credentials
- [ ] Replace `server.js` with `server-firebase.js` content
- [ ] Replace model imports with Firebase adapters
- [ ] Update controllers (see patterns below)
- [ ] Test all endpoints
- [ ] Deploy

---

## 🔄 Quick API Reference

### User Operations

```javascript
import { FirebaseUser } from "../services/firebaseUser.js";

// Find by ID
const user = await FirebaseUser.findById(userId);

// Find by email
const user = await FirebaseUser.findOne({ email });

// Create new
const user = await FirebaseUser.create({ name, email, passwordHash });

// Update
await user.updateOne({ credits: newValue });

// Delete
await user.deleteOne();

// Compare password
const isMatch = await user.comparePassword(plainPassword);

// Safe JSON (no secrets)
const safe = user.toSafeJSON();
```

### Resume Operations

```javascript
import { FirebaseResume } from "../services/firebaseResume.js";

// Find by ID
const resume = await FirebaseResume.findById(resumeId);

// Find all for user
const resumes = await FirebaseResume.find({ userId });

// Create
const resume = await FirebaseResume.create({
  userId,
  name,
  fileName,
  mimeType,
  sizeBytes,
  storageKey,
  extractedText,
});

// Update
await resume.updateOne({ extractedText: newText });

// Delete
await resume.deleteOne();
```

### Subscription/Application Operations

```javascript
import { 
  FirebaseSubscription, 
  FirebaseApplication 
} from "../services/firebaseModels.js";

// Subscription
const sub = await FirebaseSubscription.create({ userId, plan });
const sub = await FirebaseSubscription.findOne({ userId });
await sub.updateOne({ plan: "pro" });

// Application
const app = await FirebaseApplication.create({ userId, jobId });
const apps = await FirebaseApplication.find({ userId });
await app.updateOne({ status: "accepted" });
```

### Utility Functions

```javascript
import {
  deductCredits,
  getUserPlan,
  getUserResumes,
  setMasterResume,
  logAIUsage,
  getUserUsageStats,
  upgradeUserPlan,
} from "../services/firebaseUtils.js";

// Deduct credits
const user = await deductCredits(userId, 5, "resume_analysis");

// Get plan info
const plan = await getUserPlan(userId);

// Get all resumes
const resumes = await getUserResumes(userId);

// Set master resume
await setMasterResume(userId, resumeId);

// Log AI operation
await logAIUsage(userId, "interview_prep", 3);

// Usage stats (last 30 days)
const stats = await getUserUsageStats(userId);

// Upgrade plan
await upgradeUserPlan(userId, "pro");
```

---

## 📁 File Mapping

| Mongoose | Firebase |
|----------|----------|
| `models/User.js` | `services/firebaseUser.js` |
| `models/Resume.js` | `services/firebaseResume.js` |
| `models/Subscription.js` | `services/firebaseModels.js` |
| `models/Application.js` | `services/firebaseModels.js` |
| `models/Usage.js` | `services/firebaseModels.js` |
| `config/db.js` | `config/firebase.js` |

---

## 🚀 To Start Using Firebase

### 1. Copy Firebase server
```bash
cp backend/server-firebase.js backend/server.js
```

### 2. Copy env template
```bash
cp backend/.env.firebase.example backend/.env
```

### 3. Update .env with Firebase credentials
```
FIREBASE_PROJECT_ID=your-id
FIREBASE_PRIVATE_KEY=your-key
FIREBASE_CLIENT_EMAIL=your-email
FIREBASE_DATABASE_URL=https://your-id.firebaseio.com
```

### 4. Update controller imports
```javascript
// Before
import User from "../models/User.js";

// After
import { FirebaseUser } from "../services/firebaseUser.js";
```

### 5. Update model calls
```javascript
// Same method names work!
const user = await FirebaseUser.create({ ... });
const user = await FirebaseUser.findOne({ ... });
```

---

## ⚡ Performance Tips

1. **Avoid large scans** - Firebase reads entire result set
   - Use `.find({ userId })` instead of `.find()`

2. **Batch operations** - Use `db.ref().update()` for multiple writes

3. **Pagination** - Implement cursor-based pagination for large datasets

4. **Indexing** - Add `.indexOn` rules in Firebase console for frequently filtered fields

5. **Denormalization** - Store related data together (user + subscription)

---

## ⚠️ Common Gotchas

1. **Case sensitivity** - Firebase sorts are case-sensitive. Normalize to lowercase.

2. **No transactions** - Can't span multiple nodes. Design schema accordingly.

3. **Size limits** - Single value can't exceed 16MB. Split if needed.

4. **Cold starts** - First read after inactivity can be slow.

5. **Sync issues** - Use `.off()` to prevent memory leaks in real apps.

---

## 📞 Support Documents

- **Full Guide:** `FIREBASE_MIGRATION_GUIDE.md`
- **Implementation:** `FIREBASE_IMPLEMENTATION_GUIDE.md`
- **Utils:** `services/firebaseUtils.js`
- **Config:** `config/firebase.js`

---

## 🧪 Test Commands

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get user (with JWT)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer JWT_TOKEN_HERE"
```

---

Need help? See the full implementation guide!
