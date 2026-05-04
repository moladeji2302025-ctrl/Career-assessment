# Career Assessment

A multi-step web form that collects career-relevant data from **IT Students** and **NYSC Corp Members** posted to the organisation, then structures that data as a payload for an AI career-guidance model.

---

## Features

| Feature | Details |
|---|---|
| **Group selection** | Respondent selects IT Student or NYSC Corp Member; only the relevant fields are shown |
| **Common field** | Department posted to within the organisation |
| **IT Student fields** | Programme / Department in school · Expected completion date |
| **NYSC Corp Member fields** | Programme studied · **Degree auto-filled** from a maintainable mapping (e.g. Computer Science → BSc) · Service end date |
| **Interests & Skills section** | Career interests · Enjoyed skills · Work environment preference · Primary motivation · Biggest strength · Short-term goal · Long-term goal |
| **Review step** | Full summary before submission |
| **Client-side validation** | Every required field is validated per step before the user can advance |
| **AI-ready payload** | `buildAIPayload()` produces a flat, well-labelled JSON object ready to POST to an AI analysis endpoint |

---

## Tech Stack

- **React 19** + **TypeScript** (Vite scaffold)
- **Vercel Serverless Functions** (Node.js) for the `/api/assessments` endpoint
- **Vercel Postgres** (Neon-backed) for persistent storage
- Plain CSS (no additional UI library dependency)

---

## Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
- A [Vercel account](https://vercel.com/) (free tier works)

### Local development (recommended — uses Vercel CLI)

`vercel dev` starts the Vite frontend and the serverless functions together under a single port, so form submissions reach `/api/assessments` without any separate proxy:

```bash
npm install
vercel login          # authenticate with Vercel (one-time)
vercel link           # link the local clone to your Vercel project (one-time)
vercel env pull .env.local   # pull Postgres credentials into .env.local
vercel dev            # http://localhost:3000
```

> **Tip:** The first time a submission is made, the serverless function creates the `assessments` table automatically (`CREATE TABLE IF NOT EXISTS`).

### Frontend-only development (no database)

If you just want to work on the UI without database access:

```bash
npm install
npm run dev:frontend  # http://localhost:5173  (API calls will fail — expected)
```

---

## Deploying to Vercel

### 1. Provision a Vercel Postgres database

1. Open your project in the [Vercel dashboard](https://vercel.com/dashboard).
2. Go to **Storage** → **Create Database** → **Postgres** (powered by Neon).
3. Follow the wizard; accept the default region that matches your deployment region.
4. Once created, Vercel automatically injects the following environment variables into your project:
   - `POSTGRES_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

### 2. Deploy

```bash
vercel deploy --prod
```

Or connect your GitHub repository to Vercel for automatic deployments on every push.

### 3. Environment variables

| Variable | Set by | Description |
|---|---|---|
| `POSTGRES_URL` | Vercel (auto) | Pooled Postgres connection string |
| `POSTGRES_URL_NON_POOLING` | Vercel (auto) | Non-pooled connection string (used for migrations) |
| `POSTGRES_USER` | Vercel (auto) | Database user |
| `POSTGRES_HOST` | Vercel (auto) | Database host |
| `POSTGRES_PASSWORD` | Vercel (auto) | Database password |
| `POSTGRES_DATABASE` | Vercel (auto) | Database name |
| `VITE_API_BASE_URL` | Optional | Override the API base (leave empty on Vercel) |

See `.env.example` for a full template.

---

## Project Structure

```
api/
└── assessments.ts            # Vercel Serverless Function — POST handler + Postgres storage
src/
├── components/
│   ├── AssessmentForm.tsx        # Main orchestrator (state, validation, payload)
│   ├── steps/
│   │   ├── GroupSelection.tsx    # Step 1 – group cards
│   │   ├── BasicInfo.tsx         # Step 2 – group-specific fields
│   │   ├── SubtleQuestions.tsx   # Step 3 – interests & skills
│   │   └── Review.tsx            # Step 4 – review & submit
│   └── ui/
│       ├── FormField.tsx         # Labelled field wrapper with error display
│       └── CheckboxGroup.tsx     # Reusable multi-checkbox grid
├── data/
│   ├── programDegreeMapping.ts   # Programme → degree map (easy to extend)
│   └── organizationDepartments.ts # Dept lists and option arrays
└── types/
    └── assessment.ts             # All TypeScript interfaces & the AIAnalysisPayload type
server/                           # Legacy FastAPI backend (retained for reference)
vercel.json                       # Vercel build configuration
```

---

## Submission Flow

1. A user completes the multi-step form and clicks **Submit Assessment**.
2. `AssessmentForm.tsx` builds an `AIAnalysisPayload` and POSTs it to `/api/assessments`.
3. The Vercel Serverless Function (`api/assessments.ts`) receives the request.
4. The function validates the payload and inserts a record into Vercel Postgres.
5. On success the function returns `{ id, submittedAt }` and the frontend shows the confirmation screen.

> **Same-origin:** On Vercel, the frontend and the serverless functions share the same domain, so CORS is not required.

---

## Serverless Function API

### `POST /api/assessments`

**Request body** — `AIAnalysisPayload` (see `src/types/assessment.ts`):

```json
{
  "respondentName": "Ada Lovelace",
  "respondentGroup": "NYSC_CORP_MEMBER",
  "organizationDepartment": "Engineering",
  "programStudied": "Computer Science",
  "degreeRequired": "BSc",
  "serviceEndDate": "2025-12-01",
  "careerInterests": ["Software Engineering"],
  "enjoyedSkills": ["Problem Solving"],
  "workEnvironment": "remote",
  "primaryMotivation": "impact",
  "biggestStrength": "analytical",
  "shortTermGoal": "Land a junior dev role",
  "longTermGoal": "Lead engineering teams",
  "scenarioResponses": {}
}
```

**Success** `201 Created`:
```json
{ "id": "<uuid>", "submittedAt": "<ISO-8601 timestamp>" }
```

**Error** `400 Bad Request`:
```json
{ "detail": "Missing required field: respondentName" }
```

**Error** `500 Internal Server Error`:
```json
{ "detail": "Failed to store assessment. Please try again." }
```

---

## Extending the Degree Mapping

Open `src/data/programDegreeMapping.ts` and add a new key/value pair:

```ts
'marine biology': 'BSc',
```

That is the only change required to support a new programme.

