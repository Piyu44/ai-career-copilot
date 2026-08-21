# Firebase Implementation Guide for Backend Controllers

This guide shows how to update your existing controllers to use Firebase instead of Mongoose.

## 1. Installation & Setup

### Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### Update package.json
Your package.json should have:
```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.23.8"
  }
}
```

---

## 2. File Migration Reference

### Old File → New File
- `backend/server.js` → Use **server-firebase.js**
- `backend/config/db.js` → Use **config/firebase.js**
- `backend/models/User.js` → Use **services/firebaseUser.js**
- `backend/models/Resume.js` → Use **services/firebaseResume.js**
- `backend/models/Subscription.js` → Use **services/firebaseModels.js** → FirebaseSubscription
- `backend/models/Application.js` → Use **services/firebaseModels.js** → FirebaseApplication
- `backend/controllers/authController.js` → Reference **authController-firebase.js**

---

## 3. Pattern: Converting Mongoose Code to Firebase

### Pattern 1: Finding a User by Email

**Before (Mongoose):**
```javascript
const user = await User.findOne({ email: email.toLowerCase() });
```

**After (Firebase):**
```javascript
import { FirebaseUser } from "../services/firebaseUser.js";
const user = await FirebaseUser.findOne({ email: email.toLowerCase() });
```

---

### Pattern 2: Creating & Saving

**Before (Mongoose):**
```javascript
const user = await User.create({ name, email, passwordHash: password });
```

**After (Firebase):**
```javascript
const user = await FirebaseUser.create({ name, email, passwordHash: password });
```

---

### Pattern 3: Finding by ID

**Before (Mongoose):**
```javascript
const user = await User.findById(userId);
```

**After (Firebase):**
```javascript
const user = await FirebaseUser.findById(userId);
```

---

### Pattern 4: Finding Multiple Documents

**Before (Mongoose):**
```javascript
const resumes = await Resume.find({ userId });
```

**After (Firebase):**
```javascript
import { FirebaseResume } from "../services/firebaseResume.js";
const resumes = await FirebaseResume.find({ userId });
```

---

### Pattern 5: Updating

**Before (Mongoose):**
```javascript
await user.updateOne({ credits: user.credits - cost });
```

**After (Firebase):**
```javascript
await user.updateOne({ credits: user.credits - cost });
// Same method signature!
```

---

### Pattern 6: Deleting

**Before (Mongoose):**
```javascript
await resume.deleteOne();
```

**After (Firebase):**
```javascript
await resume.deleteOne();
// Same method signature!
```

---

## 4. Migration Checklist

- [ ] Install firebase-admin
- [ ] Rename server.js to server-old.js, rename server-firebase.js to server.js
- [ ] Update .env with Firebase credentials
- [ ] Replace model imports in controllers
- [ ] Update all find() queries if needed
- [ ] Test auth flow (register, login)
- [ ] Test resume upload/retrieval
- [ ] Test subscriptions
- [ ] Run full test suite
- [ ] Deploy to production

---

## 5. Common Issues & Solutions

### Issue: "Firebase not initialized"
**Solution:** Make sure `initializeFirebase()` is called in server.js before any routes.

### Issue: Email not found in findOne
**Solution:** Firebase's orderByChild requires indexing. Go to:
- Firebase Console → Realtime Database → Rules
- Define `.indexOn: "email"` for the users node

### Issue: Large queries are slow
**Solution:** Firebase Realtime DB isn't optimized for large scans.
- Consider using Firestore (more optimized) instead
- Implement client-side filtering
- Use pagination with cursors

### Issue: Complex queries fail
**Solution:** Firebase Realtime DB doesn't support complex queries like MongoDB.
- Fetch data and filter in application code
- Consider Firestore for complex requirements
- Use Cloud Functions for complex operations

---

## 6. Firebase Realtime Database vs Firestore

| Feature | Realtime DB | Firestore |
|---------|-------------|-----------|
| Query complexity | Basic | Advanced |
| Scalability | Good | Better |
| Pricing | Read/Write ops | Read/Write/Delete ops |
| Offline sync | Better | Good |
| Document size | < 1MB | < 1MB |

**Recommendation:** If you need complex queries, consider migrating to Firestore later.

---

## 7. Example: Updating the Resume Controller

**Original (Mongoose):**
```javascript
import Resume from "../models/Resume.js";

export const uploadResume = asyncHandler(async (req, res) => {
  const resume = await Resume.create({
    userId: req.user.sub,
    name: req.body.name,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    storageKey: req.file.path,
  });
  res.status(201).json(resume);
});
```

**Updated (Firebase):**
```javascript
import { FirebaseResume } from "../services/firebaseResume.js";

export const uploadResume = asyncHandler(async (req, res) => {
  const resume = await FirebaseResume.create({
    userId: req.user.sub,
    name: req.body.name,
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    storageKey: req.file.path,
  });
  res.status(201).json(resume);
});
```

The implementation is almost identical!

---

## 8. Environment Setup

Copy the provided `.env.firebase.example`:
```bash
cp backend/.env.firebase.example backend/.env
```

Then fill in your Firebase credentials:
- Get from Firebase Console → Project Settings → Service Accounts
- Download the JSON file and extract the required fields

---

## 9. Testing

### Test Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Protected Route (with JWT):
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 10. Next Steps

1. ✅ Follow the Firebase Migration Guide (FIREBASE_MIGRATION_GUIDE.md)
2. ✅ Set up Firebase project and credentials
3. ✅ Update all controller files using patterns above
4. ✅ Test thoroughly
5. ✅ Consider using Firebase Storage for file uploads
6. ✅ Set up Cloud Functions for complex operations
7. ✅ Monitor usage and optimize queries

---

## Support Files Generated

- `config/firebase.js` - Firebase initialization
- `services/firebaseUser.js` - User adapter
- `services/firebaseResume.js` - Resume adapter
- `services/firebaseModels.js` - Subscription, Application, Usage adapters
- `controllers/authController-firebase.js` - Example auth controller
- `server-firebase.js` - Example server.js using Firebase
- `.env.firebase.example` - Environment variables template
