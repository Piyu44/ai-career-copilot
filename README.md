# AI Career Copilot — "Your AI Partner in Getting Hired"

A production-architected full-stack SaaS for Indian students, freshers, developers and job seekers.
Upload a resume + paste a job description → match score, missing skills/keywords, improved resume,
cover letter, AI mock interviews and an application tracker — all sharing one context.

## Repository layout (frontend ⇄ backend fully separated)

```
├── frontend/                  ← ALL frontend code lives here
│   └── src/
│       ├── App.tsx            # router (lazy routes = code splitting)
│       ├── components/        # ui kit · charts · layouts · shared sections
│       ├── pages/             # landing, features, pricing, auth, dashboard,
│       │                      #   job-match, resume-tools, cover-letter,
│       │                      #   interview, ats-checker, applications, settings
│       ├── services/          # ai.ts (provider-independent) · api.ts (REST/demo adapter)
│       ├── context.tsx        # auth · data · toast providers
│       ├── hooks.ts           # reveal, count-up, debounce, page meta
│       ├── data.ts            # plans/pricing/credits config, skill graph, demo seeds
│       └── utils.ts           # cn, downloads (real PDF/DOCX), helpers
│
├── backend/                   ← ALL backend code lives here (Express + MongoDB)
│   ├── server.js              # helmet · cors · rate limits · routes
│   ├── config/                # db.js · plans.js (single pricing source)
│   ├── models/                # User · Resume · JobAnalysis · GeneratedResume ·
│   │                          #   CoverLetter · Interview · Application · Usage · Subscription
│   ├── controllers/  routes/  middleware/  utils/
│   └── services/
│       ├── aiService.js       # facade: analyzeJobMatch · improveResume ·
│       │                      #   generateCoverLetter · generateInterviewQuestions ·
│       │                      #   evaluateInterviewAnswer · atsCheck
│       ├── providers/         # mockProvider.js · openaiProvider.js
│       ├── creditService.js   # getUserCredits · consumeCredits · addCredits · hasEnoughCredits
│       └── storageService.js  # local-disk today, S3 later — same interface
│
└── src/App.tsx                # thin entry bridge into frontend/ (build harness)
```

## Demo mode

The shipped build runs with `USE_MOCK_AI=true`: a deterministic heuristic engine produces
realistic structured analyses, so the full journey works with **no API key and no server**.
Set `VITE_USE_MOCK_AI=false` to proxy to the backend, and `USE_MOCK_AI=false` + `AI_API_KEY`
server-side to go live with a real provider. Keys never reach the browser.

## The user journey

Landing → Register (10 free credits) → Dashboard → Upload resume → Paste JD →
**Match score** → Missing skills/keywords → Improve resume → Cover letter →
Mock interview → Track application → Upgrade plan (payment gateway wired at launch —
no fake checkout in demo).

## Guardrails baked in

- Match/ATS scores are always labelled **internal assessments**, never employer ATS scores
- The AI rewrites and suggests — it **never invents** experience, employers or degrees
- Credits gate every AI action; insufficient balance → upgrade flow, never negative
- Pricing, credit costs and plan entitlements are configured in one place per layer
