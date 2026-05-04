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

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run lint       # ESLint
```

### Backend (Python + MongoDB)

```bash
python -m pip install -r server/requirements.txt
python -m uvicorn server.app:app --reload --port 3001
```

The API defaults to `mongodb://localhost:27017` and can be configured via:

- `MONGODB_URI`
- `MONGODB_DB` (default: `career_assessment`)
- `MONGODB_COLLECTION` (default: `assessments`)

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

## Wiring Up the AI Endpoint

In `src/components/AssessmentForm.tsx`, find the commented-out `fetch` block inside `handleSubmit` and replace the simulated delay:

```ts
await fetch('/api/assessment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),   // payload is an AIAnalysisPayload object
});
```

---

## Extending the Degree Mapping

Open `src/data/programDegreeMapping.ts` and add a new key/value pair:

```ts
'marine biology': 'BSc',
```

That is the only change required to support a new programme.
