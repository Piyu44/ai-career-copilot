# JOB ASAP — Backend

Express + Firebase + Razorpay REST API with Groq / Gemini / OpenAI provider integration.

## Structure

```
backend/
├── server.js              # app bootstrap: helmet, cors, rate limits, routes
├── config/
│   ├── firebase.js        # Firebase Admin SDK & fallback store
│   ├── razorpay.js        # Razorpay Payment Gateway client
│   └── plans.js           # plans, pricing, credit costs (single source of truth)
├── controllers/           # handlers — auth, payment, user, resume, interview, analysis, cover letter, application
├── routes/                # REST surface under /api
├── middleware/            # auth (JWT), validation (zod), error handling, uploads
├── services/
│   ├── aiService.js       # provider-independent AI facade
│   ├── providers/         # groqProvider.js · geminiProvider.js · openaiProvider.js · mockProvider.js
│   ├── firebaseUser.js    # Firebase User model adapter
│   ├── firebaseResume.js  # Firebase Resume model adapter
│   ├── firebaseModels.js  # Firebase Subscription, Application, Usage, JobAnalysis adapters
│   ├── creditService.js   # getUserCredits · consumeCredits · addCredits · hasEnoughCredits
│   └── storageService.js  # local-disk adapter; swap in S3/cloud storage without touching controllers
└── utils/                 # AppError, asyncHandler
```

## Run

```bash
cp .env.example .env   # configured with Groq, Razorpay, Firebase, JWT secrets
npm install
npm run dev
```

With `USE_MOCK_AI=true` (default) every AI endpoint returns realistic structured demo data. Set it to `false` and provide `GROQ_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY` to route through the live provider. Keys live **only** on the server.

## REST surface

```
GET    /api/health
POST   /api/create-order           POST /api/verify-payment
POST   /api/auth/register          POST /api/auth/login
GET    /api/user/profile           PUT  /api/user/profile
GET    /api/user/usage             GET  /api/user/subscription
POST   /api/job-analysis           GET  /api/job-analysis
GET    /api/job-analysis/:id       DELETE /api/job-analysis/:id
POST   /api/resume/upload          POST /api/resume/improve
POST   /api/resume/ats-check
POST   /api/cover-letter/generate
POST   /api/interview/start        POST /api/interview/:id/answer
GET    /api/applications           POST /api/applications
PUT    /api/applications/:id       DELETE /api/applications/:id
```
