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
- **FastAPI** (Python) backend with MongoDB persistence
- Plain CSS (no additional UI library dependency)

---

## Getting Started

### Development (recommended)

Run both the React dev server and the FastAPI backend together with a single command:

```bash
npm install
npm run server:install   # install Python dependencies
npm run dev:all          # starts frontend on :5173 and backend on :3001
```

The Vite dev server automatically proxies `/api/*` requests to the FastAPI backend at `http://localhost:3001`, so form submissions work out of the box.

### Development (manual / separate terminals)

```bash
# Terminal 1 – frontend
npm install
npm run dev        # http://localhost:5173

# Terminal 2 – backend
npm run server:install
npm run server:dev # http://localhost:3001
```

### Production (single server)

Build the React app and start only the FastAPI server — it will serve both the API and the compiled frontend from port 3001:

```bash
npm install
npm run server:install
npm run start      # builds frontend then starts FastAPI on :3001
```

Or step by step:

```bash
npm run build:full          # type-check + Vite build + Python compile
npm run server:start        # serve on 0.0.0.0:3001
```

---

## Project Structure

```
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
```

---

## Environment Configuration

Copy `.env.example` to `.env` and set the values for your environment before starting the backend:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DB` | `career_assessment` | Database name |
| `MONGODB_COLLECTION` | `assessments` | Collection name |

---

## Submission Flow

1. A user completes the multi-step form and clicks **Submit Assessment**.
2. `AssessmentForm.tsx` builds an `AIAnalysisPayload` and POSTs it to `/api/assessments`.
3. **Development**: the Vite dev server proxies `/api` to the FastAPI backend at `http://localhost:3001`.
4. **Production**: the built frontend is served by FastAPI itself, so `/api/assessments` hits the same origin — no proxy needed.
5. The FastAPI backend validates the payload and inserts it into MongoDB.
6. On success the frontend shows the submission confirmation screen.

---

## Extending the Degree Mapping

Open `src/data/programDegreeMapping.ts` and add a new key/value pair:

```ts
'marine biology': 'BSc',
```

That is the only change required to support a new programme.
