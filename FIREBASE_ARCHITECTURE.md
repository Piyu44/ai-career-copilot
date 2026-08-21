# Firebase Architecture Diagram & Data Flow

## 📊 Current Architecture (MongoDB → Firebase)

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React/Vue)                        │
│                   (5173 - localhost:5173)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP
                    [JWT Auth Headers]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Express Backend API (:5000)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth       │  │   Resume     │  │   AI        │          │
│  │  Controller  │  │  Controller  │  │  Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         ↓                   ↓                  ↓                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Firebase Adapters / Utils                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ FirebaseUser │  │FirebaseResume│  │ Utils        │   │  │
│  │  │   adapter    │  │  adapter     │  │ (credits,    │   │  │
│  │  │              │  │              │  │  usage, etc) │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│              Firebase Admin SDK (Node.js)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
              [Service Account Authentication]
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│        🔥 Firebase Cloud (Secure Real-time DB)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          Realtime Database Structure                       │ │
│  │                                                             │ │
│  │  users/                                                   │ │
│  │    {userId}                                               │ │
│  │      ├─ name                                              │ │
│  │      ├─ email                                             │ │
│  │      ├─ passwordHash                                      │ │
│  │      ├─ plan                                              │ │
│  │      └─ credits                                           │ │
│  │                                                             │ │
│  │  resumes/                                                 │ │
│  │    {resumeId}                                             │ │
│  │      ├─ userId                                            │ │
│  │      ├─ name                                              │ │
│  │      ├─ extractedText                                     │ │
│  │      └─ ...                                               │ │
│  │                                                             │ │
│  │  applications/, subscriptions/, usage/                    │ │
│  │    ...                                                     │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Security Rules (User Isolation)               │ │
│  │  - Only users can read/write their own data              │ │
│  │  - Passwords/tokens hidden                              │ │
│  │  - Admin-only operations protected                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Example: User Registration

```
1. Frontend sends registration request
   ┌─────────────────────────────────────────────────┐
   │ POST /api/auth/register                         │
   │ {name, email, password}                         │
   └─────────────────────────────────────────────────┘
                        ↓

2. Server receives & validates
   ┌─────────────────────────────────────────────────┐
   │ authController.register()                       │
   │ - Validate input (Zod)                          │
   │ - Check email uniqueness                        │
   └─────────────────────────────────────────────────┘
                        ↓

3. Create user via Firebase adapter
   ┌─────────────────────────────────────────────────┐
   │ FirebaseUser.create({                           │
   │   name,                                         │
   │   email,                                        │
   │   passwordHash: password                        │
   │ })                                              │
   └─────────────────────────────────────────────────┘
                        ↓

4. Adapter hashes password & saves to Firebase
   ┌─────────────────────────────────────────────────┐
   │ await user.save()                               │
   │ - Hash password with bcrypt                     │
   │ - Write to: /users/{userId}/                    │
   │ - Returns user object                           │
   └─────────────────────────────────────────────────┘
                        ↓

5. Firebase stores encrypted data
   ┌─────────────────────────────────────────────────┐
   │ Realtime Database:                              │
   │ users/abc123xyz/                                │
   │   {                                             │
   │     id: "abc123xyz",                            │
   │     name: "John Doe",                           │
   │     email: "john@example.com",                  │
   │     passwordHash: "$2b$12$...",  # encrypted   │
   │     plan: "free",                               │
   │     credits: 10,                                │
   │     createdAt: "2024-08-20T..."                │
   │   }                                             │
   └─────────────────────────────────────────────────┘
                        ↓

6. Server creates JWT & subscription
   ┌─────────────────────────────────────────────────┐
   │ - Generate JWT token                            │
   │ - Create subscription record                    │
   │ - Return token + safe user data                 │
   └─────────────────────────────────────────────────┘
                        ↓

7. Frontend receives response with token
   ┌─────────────────────────────────────────────────┐
   │ {                                               │
   │   token: "eyJhbGc...",                          │
   │   user: {                                       │
   │     id: "abc123xyz",                            │
   │     name: "John Doe",                           │
   │     email: "john@example.com",                  │
   │     plan: "free",                               │
   │     credits: 10                                 │
   │   }                                             │
   │ }                                               │
   └─────────────────────────────────────────────────┘
                        ↓

8. Frontend stores token & redirects to dashboard ✅
```

---

## 🔐 Security Flow

```
┌────────────────────────────────────────────────────────┐
│           Frontend sends protected request              │
│         GET /api/auth/me (with JWT token)              │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│         Middleware: authMiddleware.js                  │
│  - Extract token from Authorization header            │
│  - Verify JWT signature with JWT_SECRET               │
│  - Decode userId & plan from token                    │
│  - Attach user object to request                      │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│         Controller receives authenticated request      │
│  - req.user.sub contains userId                       │
│  - Query Firebase with userId                         │
│  - Return only that user's data                       │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│         Firebase Security Rules Check                  │
│  rule: ".read": "auth.uid === $uid"                   │
│  - Validates user can only read own data              │
│  - Rejects unauthorized access                        │
│  - Returns data if authorized ✓                       │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│         User's safe JSON sent to frontend              │
│  (no passwordHash, resetToken, or other secrets)      │
└────────────────────────────────────────────────────────┘
```

---

## 📁 Database Structure

```
Firebase Realtime Database
│
├── users/
│   ├── user_id_1/
│   │   ├── id: "user_id_1"
│   │   ├── name: "John Doe"
│   │   ├── email: "john@example.com"
│   │   ├── passwordHash: "$2b$12$..."  (encrypted)
│   │   ├── plan: "free"
│   │   ├── credits: 10
│   │   ├── resetToken: null
│   │   ├── resetExpires: null
│   │   ├── createdAt: "2024-08-20T11:49:10.543Z"
│   │   └── updatedAt: "2024-08-20T11:49:10.543Z"
│   │
│   └── user_id_2/
│       └── ...
│
├── resumes/
│   ├── resume_id_1/
│   │   ├── id: "resume_id_1"
│   │   ├── userId: "user_id_1"  (for fast user lookup)
│   │   ├── name: "My Resume"
│   │   ├── fileName: "resume.pdf"
│   │   ├── mimeType: "application/pdf"
│   │   ├── extractedText: "John Doe, Software Engineer..."
│   │   ├── isMaster: true
│   │   ├── createdAt: "2024-08-20T11:49:10.543Z"
│   │   └── updatedAt: "2024-08-20T11:49:10.543Z"
│   │
│   └── resume_id_2/
│       └── ...
│
├── applications/
│   ├── app_id_1/
│   │   ├── id: "app_id_1"
│   │   ├── userId: "user_id_1"
│   │   ├── jobId: "job_123"
│   │   ├── status: "pending"
│   │   ├── appliedAt: "2024-08-20T11:49:10.543Z"
│   │   └── ...
│   └── ...
│
├── subscriptions/
│   ├── sub_id_1/
│   │   ├── id: "sub_id_1"
│   │   ├── userId: "user_id_1"
│   │   ├── plan: "free"
│   │   ├── renewalDate: "2024-09-20T11:49:10.543Z"
│   │   └── ...
│   └── ...
│
├── interviews/
│   ├── interview_id_1/
│   │   ├── userId: "user_id_1"
│   │   ├── title: "System Design Interview"
│   │   └── ...
│   └── ...
│
├── coverLetters/
│   ├── letter_id_1/
│   │   ├── userId: "user_id_1"
│   │   ├── content: "Dear Hiring Manager..."
│   │   └── ...
│   └── ...
│
├── jobAnalyses/
│   ├── analysis_id_1/
│   │   ├── userId: "user_id_1"
│   │   ├── analysis: {/*...*/}
│   │   └── ...
│   └── ...
│
└── usage/
    ├── usage_id_1/
    │   ├── userId: "user_id_1"
    │   ├── action: "resume_analysis"
    │   ├── creditsUsed: 5
    │   ├── timestamp: "2024-08-20T11:49:10.543Z"
    │   └── ...
    └── ...
```

---

## ⚙️ Configuration Flow

```
Environment Variables (.env)
  │
  ├─ FIREBASE_PROJECT_ID
  ├─ FIREBASE_PRIVATE_KEY
  ├─ FIREBASE_CLIENT_EMAIL
  └─ FIREBASE_DATABASE_URL
            ↓
     config/firebase.js
            ↓
  admin.initializeApp({
    credential: cert({...}),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  })
            ↓
     Firebase Admin SDK
            ↓
  Real-time connection to Firebase Database
```

---

## 🔄 Comparison: Mongoose vs Firebase

### Creating a User

**Mongoose (Old):**
```javascript
const userSchema = new Schema({ ... });
const User = mongoose.model('User', userSchema);
const user = new User({ ... });
await user.save();
```

**Firebase (New):**
```javascript
class FirebaseUser {
  async save() {
    const db = getDatabase();
    await db.ref(`users/${this._id}`).set(this.data());
  }
}
const user = new FirebaseUser({ ... });
await user.save();
```

### Reading a User

**Mongoose:**
```javascript
const user = await User.findOne({ email });
```

**Firebase:**
```javascript
const user = await FirebaseUser.findOne({ email });
```

**Result:** Same interface! 🎉

---

## 📊 Data Flow Diagram: Resume Analysis

```
User uploads resume
        ↓
┌───────────────────────────┐
│ Frontend sends file (PDF) │
└───────────────────────────┘
        ↓
┌───────────────────────────────┐
│ Backend receives file         │
│ - Validate MIME type          │
│ - Save to disk/storage        │
└───────────────────────────────┘
        ↓
┌───────────────────────────────┐
│ Parse PDF → Extract text      │
└───────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│ Create Resume record in Firebase              │
│ FirebaseResume.create({                       │
│   userId,                                     │
│   name,                                       │
│   extractedText,                              │
│   storageKey: "path/to/file.pdf"              │
│ })                                            │
└───────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│ Save to: resumes/{resumeId}                   │
│ {                                             │
│   userId: "abc123",                           │
│   extractedText: "John Doe, Software Eng..." │
│   ...                                         │
│ }                                             │
└───────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│ Deduct credits from user                      │
│ deductCredits(userId, 5, "resume_upload")    │
│ - user.credits -= 5                           │
│ - save to Firebase                            │
│ - log to usage/ collection                    │
└───────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────┐
│ Send AI analysis request                      │
│ (to OpenAI, Claude, etc.)                     │
└───────────────────────────────────────────────┘
        ↓
✅ Resume saved & analyzed!
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│            Your VPS / Cloud Server              │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │   Node.js Express Backend                  │ │
│  │   server.js (using firebase.js)            │ │
│  │                                             │ │
│  │   - routes/                                │ │
│  │   - controllers/                           │ │
│  │   - services/firebase*.js   ← NEW!        │ │
│  │   - config/firebase.js      ← NEW!        │ │
│  │   - .env (with Firebase creds)             │ │
│  │                                             │ │
│  └───────────────────────────────────────────┘ │
│           ↓                      ↓              │
│      [Port 5000]          [HTTPS only]         │
└─────────────────────────────────────────────────┘
         ↓                         ↓
    Frontend                Firebase Servers
    (:5173)                 (Cloud hosted)
                           High availability
                           Auto-scaling
                           Backup & redundancy
```

---

This architecture provides:
- ✅ **Scalability** - Firebase handles millions of concurrent users
- ✅ **Security** - End-to-end encryption, role-based rules
- ✅ **Real-time** - Live data sync (useful for future features)
- ✅ **Reliability** - Automatic backups & disaster recovery
- ✅ **Cost-effective** - Pay only for what you use
