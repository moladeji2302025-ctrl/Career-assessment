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
| **Scenario questions** | 20 situation-based questions that surface working style and values |
| **Review step** | Full summary before submission |
| **Client-side validation** | Every required field is validated per step before the user can advance |
| **AI-ready payload** | `buildAIPayload()` produces a flat, well-labelled JSON object ready to POST to an AI analysis endpoint |

---

## Tech Stack

- **React 19** + **TypeScript** (Vite scaffold)
- **Vercel Serverless Functions** (Node.js) for the `/api/assessments` endpoint
- **Vercel Postgres** (Neon-backed) for persistent storage — optional; falls back gracefully to Google Sheets if not configured
- **Google Sheets** (via Apps Script) as a zero-infrastructure storage backend
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

### 1. (Optional) Provision a Vercel Postgres database

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
| `POSTGRES_URL_NON_POOLING` | Vercel (auto) | Non-pooled connection string |
| `POSTGRES_USER` | Vercel (auto) | Database user |
| `POSTGRES_HOST` | Vercel (auto) | Database host |
| `POSTGRES_PASSWORD` | Vercel (auto) | Database password |
| `POSTGRES_DATABASE` | Vercel (auto) | Database name |
| `GOOGLE_SHEETS_WEBHOOK_URL` | You | Apps Script Web App URL (see below) |
| `GOOGLE_SHEETS_SECRET` | You (optional) | Shared secret for webhook auth |
| `VITE_API_BASE_URL` | Optional | Override the API base (leave empty on Vercel) |

See `.env.example` for a full template.

---

## Google Sheets Storage

If you prefer not to set up a Postgres database — or want responses saved in both places — you can use a Google Sheet as a zero-infrastructure backend.

### How it works

1. The Vercel serverless function (`api/assessments.ts`) forwards every validated submission to an Apps Script Web App you control.
2. The Apps Script (`apps-script/Code.gs`) appends a new row to a Google Sheet — one column per field, including all 20 scenario-question answers.
3. Postgres and Google Sheets run **in parallel**. The API returns `201` if at least one backend succeeds, so a Postgres outage does not break the form.

### Setup (≈ 10 minutes)

#### Step 1 — Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet (name it anything, e.g. **Career Responses**).
2. Leave the first sheet as-is — the script creates the header row automatically.

#### Step 2 — Add the Apps Script

1. In the sheet, open **Extensions → Apps Script**.
2. Delete any placeholder code and paste the entire contents of **`apps-script/Code.gs`** from this repository.
3. Save the project (Ctrl + S).

#### Step 3 — (Recommended) Set a shared secret

1. In Apps Script, go to **Project Settings** (gear icon) → **Script Properties**.
2. Click **Add property**, set the name to `SHARED_SECRET` and the value to a random string of your choice (e.g. a UUID or a long random password). Save.
3. Note the value — you'll use it as `GOOGLE_SHEETS_SECRET` in Vercel.

#### Step 4 — Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Set **Type** to **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**.
5. Click **Deploy**, then **Authorise access** (Google will ask you to allow the script to edit your sheet).
6. Copy the **Web App URL** (it looks like `https://script.google.com/macros/s/.../exec`).

> **Re-deploying after code changes:** Each time you edit `Code.gs` you must go to **Deploy → Manage deployments → pencil icon → "New version" → Deploy** for the changes to take effect.

#### Step 5 — Set Vercel environment variables

In your Vercel project dashboard → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `GOOGLE_SHEETS_WEBHOOK_URL` | The Web App URL from Step 4 |
| `GOOGLE_SHEETS_SECRET` | The shared secret from Step 3 (optional but recommended) |

#### Step 6 — Smoke-test

Visit your Web App URL directly in a browser. You should see:

```json
{ "ok": true, "message": "Career Assessment Apps Script is running." }
```

Then submit a test assessment through the form — a new row should appear in the Google Sheet within a few seconds.

---

## Project Structure

```
api/
└── assessments.ts            # Vercel Serverless Function — POST handler, Postgres + Sheets storage
apps-script/
└── Code.gs                   # Google Apps Script — appends responses to a Google Sheet
src/
├── components/
│   ├── AssessmentForm.tsx        # Main orchestrator (state, validation, payload)
│   ├── steps/
│   │   ├── Welcome.tsx           # Step 1 – name entry
│   │   ├── GroupSelection.tsx    # Step 2 – group cards
│   │   ├── BasicInfo.tsx         # Step 3 – group-specific fields
│   │   ├── SubtleQuestions.tsx   # Step 4 – interests, skills & scenario questions
│   │   └── Review.tsx            # Step 5 – review & submit
│   └── ui/
│       ├── FormField.tsx         # Labelled field wrapper with error display
│       ├── CheckboxGroup.tsx     # Reusable multi-checkbox grid
│       └── CategorizedCheckboxGroup.tsx  # Checkbox grid with category headers
├── data/
│   ├── scenarioQuestions.ts          # 20 scenario-based interest questions
│   ├── programDegreeMapping.ts       # Programme → degree map (easy to extend)
│   ├── organizationDepartments.ts    # Dept lists, career interests, skill options
│   └── nigerianUniversityPrograms.ts # Programme name suggestions
└── types/
    └── assessment.ts             # All TypeScript interfaces & the AIAnalysisPayload type
vercel.json                       # Vercel build configuration
```

---

## Submission Flow

1. A user completes the multi-step form and clicks **Submit Assessment**.
2. `AssessmentForm.tsx` builds an `AIAnalysisPayload` and POSTs it to `/api/assessments`.
3. The Vercel Serverless Function (`api/assessments.ts`) receives and validates the request.
4. The function attempts to store the data in **Vercel Postgres** and forward it to **Google Sheets** concurrently.
5. On success (at least one backend accepted the data) the function returns `{ id, submittedAt }` and the frontend shows the confirmation screen.

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
  "scenarioResponses": { "sq_problem_solving": "break_down_methodically" }
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

**Error** `413 Payload Too Large`:
```json
{ "detail": "Payload too large." }
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

