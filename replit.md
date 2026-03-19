# Career-Pilot — AI-Powered Career Guidance Platform

## Overview

Career-Pilot is a full-stack AI-powered career guidance platform. Users upload their resume (PDF or TXT) or type their skills on the landing page to unlock the app. The resume is sent to an n8n webhook for AI-powered job matching. Once matched, users can search live job listings (Tavily API), explore learning courses across 8 platforms, take multi-level skill assessments across 8 tracks, and view their session activity on a profile page. All user data lives in browser `sessionStorage` — nothing is stored server-side.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript
- Vite as build tool and dev server (HMR enabled)
- Wouter for lightweight client-side routing
- TanStack Query v5 for server state management and data fetching

**UI Component System**
- shadcn/ui component library (Radix UI primitives)
- Tailwind CSS for utility-first styling with custom design tokens
- Lucide React for icons
- Recharts for assessment result charts (bar chart + radar chart)

**Design System**
- Light/dark theme support via CSS variables
- Blue-purple gradient color scheme for branding
- Mobile-first responsive layout
- Sticky navigation header

**State Management**
- `UserContext` (React Context) — central session state for profile + activity
- Backed by `sessionStorage` keys: `careerPilot_profile` and `careerPilot_activity`
- Protected routes (`/career`, `/courses`, `/assessment`, `/profile`) redirect to `/` when no profile exists
- Sign-out clears sessionStorage and resets context
- Local UI state via React hooks; form state via react-hook-form + Zod

**Auth / Session Flow**
- Landing page `/` is the auth gate — resume upload triggers n8n webhook + PDF parsing, stores profile in UserContext
- No accounts, no passwords, no server-side session
- Session ends when the tab is closed (sessionStorage behavior)
- Activity log tracks: career searches, course topic clicks, assessment level results (pass/fail + score)

**Key Frontend Files**
- `client/src/context/UserContext.tsx` — UserProvider, useUser hook, sessionStorage persistence
- `client/src/lib/resumeParser.ts` — PDF/TXT extraction (pdfjs-dist) + section parsing
- `client/src/components/ResumeUpload.tsx` — upload gate, 5-step pipeline overlay, results modal
- `client/src/components/Navigation.tsx` — conditional nav + profile avatar dropdown
- `client/src/pages/Career.tsx` — live job search with Tavily API + 4 filters
- `client/src/pages/Courses.tsx` — 8 platforms × 15 topics = 120 topics, search filter, direct platform links
- `client/src/pages/Assessment.tsx` — 8 skill tracks × 3 levels (quiz, practical, interview) with useReducer state machine
- `client/src/pages/Profile.tsx` — profile, resume sections, job matches, activity log

### Backend Architecture

**Server**
- Express.js HTTP server on port 5000
- TypeScript with ESM modules
- Vite middleware in development; serves `dist/public` in production

**API Routes** (`server/routes.ts`)
- `GET /api/jobs` — proxies job search to Tavily API
- No other persistent API endpoints — all user state is client-side

**Job Search Service** (`server/tavilyJobs.ts`)
- Accepts: `search`, `location`, `jobType`, `experienceLevel` query params
- Builds a natural-language query and calls Tavily Search API
- Formats results: title, company, location, salary (USD + Indian LPA → rupees), apply URL
- Returns empty array on API error (never crashes)

**Storage** (`server/storage.ts`)
- In-memory `MemStorage` class implementing `IStorage` interface
- No database used — backend is stateless beyond the current HTTP request
- All user-relevant data (profile, activity, job matches) stays in client sessionStorage

**Shared Schema** (`shared/schema.ts`)
- Drizzle ORM schema definitions shared between frontend and backend
- Zod schemas generated via `drizzle-zod` for runtime validation

### Assessment System Details

The Assessment page (`client/src/pages/Assessment.tsx`) is the most complex part of the app.

**State Machine**
- Managed by `useReducer` with `AssessmentState`
- Actions: `SELECT_SKILL`, `START_LEVEL`, `SUBMIT_LEVEL1`, `SUBMIT_LEVEL2`, `SUBMIT_LEVEL3`, `RETRY_LEVEL`, `SHOW_RESULTS`, `HIDE_RESULTS`
- `SELECT_SKILL` resets all state to `initialState`

**8 Skill Tracks**
Each track defines: label, description, 8 MCQ questions (Level 1), 3 keyword sets (Level 2), 5 interview questions with keyword arrays (Level 3), and course recommendations (beginner/intermediate/advanced).

Tracks: Frontend Development, Backend Development, Data Science & ML, DevOps & Cloud, Cybersecurity, UI/UX Design, Mobile Development, Databases

**Scoring**
- Level 1 (Quiz): score = (correct / 8) × 100. Pass = ≥ 60%.
- Level 2 (Practical): keyword match across 3 files (dataset 15pt, methodology 20pt, results 15pt) = max 50pt. Score = (total/50) × 100. Pass = ≥ 60%.
- Level 3 (Interview): keyword match per question, averaged. Pass = ≥ 60%.
- All levels show **Passed** or **Failed** badge — Level 3 always opens results page regardless of pass/fail, so users can access mock interview platform recommendations.

**Results View**
- Overall Average Score — averages only completed/attempted levels (not unstarted ones defaulting to 0)
- `resultsContext` shows interview prep platforms if Level 3 was attempted (passed OR failed)
- "View Current Results" button appears after any level is completed

**Platform Course URLs (PLATFORM_URLS)**
```
Coursera:         https://www.coursera.org/search?query=
Udemy:            https://www.udemy.com/courses/search/?q=
edX:              https://www.edx.org/search?q=
Pluralsight:      https://www.pluralsight.com/search?q=
Great Learning:   https://www.mygreatlearning.com/academy/search?keyword=
Simplilearn:      https://www.simplilearn.com/search?query=
upGrad:           https://www.upgrad.com/search/?q=
LinkedIn Learning: https://www.linkedin.com/learning/search?keywords=
```
These same URLs are used in both `Assessment.tsx` (PLATFORM_URLS map) and `Courses.tsx` (platform objects).

### Course Explorer Details

`client/src/pages/Courses.tsx` — 8 platforms × 15 topics = 120 total topics.
- Topics have 6 categories: tech, business, data, design, cloud, soft
- Topic click: `window.open(platform.url + encodeURIComponent(topicName.toLowerCase()), "_blank")`
- Live search filters across all platforms simultaneously

### External Services

**Tavily Search API**
- Used for live job search on Career page
- Requires `TAVILY_API_KEY` environment variable (Replit Secret)
- If missing, `/api/jobs` returns a 500 error with `{"error":"Failed to fetch live jobs"}`

**n8n Webhook**
- URL: `https://n8n-production-6a89.up.railway.app/webhook/resume-upload`
- Receives: `{ fileName, fileBase64 }` (POST, JSON)
- Returns: `{ total_jobs_analyzed, top_matches: [{ job_title, match_percentage, required_skills_present, skill_gaps, overall_assessment }] }`
- Client-side only — called from `ResumeUpload.tsx`

**pdfjs-dist**
- Client-side PDF text extraction
- Worker loaded from CDN
- Used in `client/src/lib/resumeParser.ts`

**Web Speech API**
- Browser-native voice recording for Level 3 interview answers
- No external service — gracefully degrades if browser doesn't support it

## Development Notes

- **Never modify** `server/vite.ts`, `vite.config.ts`, or `drizzle.config.ts`
- **Never edit** `package.json` directly — use the package management tools
- Both frontend and backend run on **port 5000** via `npm run dev`
- HMR handles frontend changes automatically; backend changes require workflow restart
- No database setup needed — the app works entirely with in-memory + sessionStorage

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TAVILY_API_KEY` | Yes (for job search) | Tavily API key — set in Replit Secrets |

No other environment variables are needed.
