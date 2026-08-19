# AI Career Copilot — Backend

Express + MongoDB REST API with a provider-independent AI service layer.

## Structure

```
backend/
├── server.js              # app bootstrap: helmet, cors, rate limits, routes
├── config/
│   ├── db.js              # MongoDB (Atlas) connection
│   └── plans.js           # plans, pricing, credit costs (single source of truth)
├── models/                # Mongoose: User, Resume, JobAnalysis, GeneratedResume,
│                          #   CoverLetter, Interview, Application, Usage, Subscription
├── controllers/           # thin handlers — validate, delegate, respond
├── routes/                # REST surface under /api
├── middleware/            # auth (JWT), validation (zod), error handling, uploads
├── services/
│   ├── aiService.js       # provider-independent facade
│   ├── providers/         # mockProvider.js · openaiProvider.js (add more here)
│   ├── creditService.js   # getUserCredits · consumeCredits · addCredits · hasEnoughCredits
│   └── storageService.js  # local-disk adapter; swap in S3 without touching controllers
└── utils/                 # AppError, asyncHandler
```

## Run

```bash
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET
npm install
npm run dev
```

With `USE_MOCK_AI=true` (default) every AI endpoint returns realistic structured
demo data — no API key required. Set it to `false` and provide `AI_API_KEY` to
route through the configured provider. Keys live **only** on the server.

## REST surface

```
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

## Security notes

- bcrypt password hashing, signed JWTs, `select: false` on sensitive fields
- zod input validation on every mutating route
- file type/size validation in the upload middleware (PDF/DOCX, 5 MB cap)
- per-route rate limits; generic error responses (no stack traces in prod)
- Payments & email are stubbed behind services — no fake success flows
