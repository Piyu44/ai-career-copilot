# JOB ASAP — "Your AI Partner in Getting Hired"

A production-architected full-stack SaaS for students, freshers, developers and job seekers.
Upload a resume + paste a job description → match score, missing skills/keywords, improved resume,
cover letter, AI mock interviews and an application tracker — all sharing one context.

## Repository layout (frontend ⇄ backend fully separated)

```
├── frontend/                  ← ALL frontend code lives here
│   └── src/
│       ├── App.tsx            # router (lazy routes = code splitting)
│       ├── components/        # ui kit · charts · layouts · shared sections · Razorpay modal
│       ├── pages/             # landing, features, pricing, auth, dashboard,
│       │                      #   job-match, resume-tools, cover-letter,
│       │                      #   interview, ats-checker, applications, settings
│       ├── services/          # ai.ts · api.ts · firebase.ts · firebaseAuth.ts · razorpay.ts
│       ├── context.tsx        # auth · data · toast providers
│       ├── hooks.ts           # reveal, count-up, debounce, page meta
│       ├── data.ts            # plans/pricing/credits config, skill graph, demo seeds
│       └── utils.ts           # cn, downloads (real PDF/DOCX), helpers
│
├── backend/                   ← ALL backend code lives here (Express + Firebase + Razorpay + Groq/Gemini/OpenAI)
│   ├── server.js              # helmet · cors · rate limits · routes
│   ├── config/                # firebase.js · razorpay.js · plans.js (single pricing source)
│   ├── controllers/  routes/  middleware/  utils/
│   └── services/
│       ├── aiService.js       # facade: analyzeJobMatch · improveResume ·
│       │                      #   generateCoverLetter · generateInterviewQuestions ·
│       │                      #   evaluateInterviewAnswer · atsCheck
│       ├── providers/         # groqProvider.js · geminiProvider.js · openaiProvider.js · mockProvider.js
│       ├── firebaseUser.js    # User data adapter (Firebase Realtime DB / memory)
│       ├── firebaseResume.js  # Resume data adapter
│       ├── firebaseModels.js  # Subscription, Application, Usage, JobAnalysis adapters
│       ├── creditService.js   # getUserCredits · consumeCredits · addCredits · hasEnoughCredits
│       └── storageService.js  # local-disk today, S3 later — same interface
│
└── src/App.tsx                # thin entry bridge into frontend/ (build harness)
```

## Database & Auth Architecture

- **Authentication**: Firebase Authentication (Email/Password, Email Verification, Password Reset).
- **Database**: Firebase Realtime Database with client and server adapters.
- **Payments**: Razorpay Payment Gateway integration (Live / Test modes with HMAC-SHA256 signature verification).
- **AI Providers**: Groq (LLaMA-3.3-70B), Google Gemini, OpenAI, and Heuristic Mock Engine.

## The user journey

Landing → Register (10 free credits) → Dashboard → Upload resume → Paste JD →
**Match score** → Missing skills/keywords → Improve resume → Cover letter →
Mock interview → Track application → Upgrade plan (Razorpay gateway with UPI/Card/NetBanking).
