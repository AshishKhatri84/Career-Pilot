# CareerPilot — AI-Powered Career Guidance Platform

> A free, session-based career guidance web app that helps you understand your job fit, search live listings, assess your skills, and find the right resources to grow — all without creating an account.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Application Architecture](#application-architecture)
4. [Tech Stack](#tech-stack)
5. [Integrations & External Services](#integrations--external-services)
6. [Frontend Structure](#frontend-structure)
7. [Backend Structure](#backend-structure)
8. [Data Flow & Workflow](#data-flow--workflow)
9. [Authentication & Session Model](#authentication--session-model)
10. [Pages & Components](#pages--components)
11. [Environment Variables](#environment-variables)
12. [Running Locally](#running-locally)
13. [Project Structure](#project-structure)
14. [Key Design Decisions](#key-design-decisions)

---

## Overview

CareerPilot is a full-stack web application built with React (Vite) on the frontend and Express on the backend. Users upload their resume once to unlock the entire app. From that point, they can see which job roles they match best, search live job listings, take structured skill assessments across 8 skill tracks, and explore learning resources on popular platforms.

All user data is stored in browser `sessionStorage` — no database, no accounts, no server-side personal data storage. Everything clears when the tab is closed or the user signs out.

---

## Features

### 1. Resume Upload & AI Job Matching

- Upload a resume as **PDF or TXT** (max 10 MB)
- The file is sent to an **n8n automation webhook** that runs AI analysis
- The AI compares your resume against real job roles and returns:
  - A ranked list of top matching roles
  - Compatibility percentage per role
  - Skills already present in your resume per role
  - Skill gaps (missing skills) per role
  - An overall assessment per role
- Results are displayed in a modal with a **"Top Match" badge** on the best-fit role
- Clicking **"View Job Openings"** navigates to the Career page with your top match auto-searched
- A 5-step animated **pipeline overlay** plays during analysis
- PDF text is extracted **client-side** using `pdfjs-dist` — resume content never touches our server

---

### 2. Live Job Search (Career Page)

- Powered by the **Tavily Search API** — returns real, current job listings from the web
- Search by **job title or keyword**
- Filter by **location**, **job type** (full-time, part-time, contract, internship), and **experience level** (entry, mid, senior)
- Each result displays: title, company, location, job type, experience level, salary range (when available), description snippet, and a direct **Apply** link
- Salary is shown in the correct format:
  - USD values formatted as `$X – $Y` or `Up to $Y`
  - Indian salaries shown in LPA converted to full rupee amounts
- The top AI-matched role from your resume is used as the **default search** automatically
- All searches are logged to your activity history

---

### 3. Multi-Level Skill Assessment (Assessment Page)

A structured, three-level assessment covering **8 skill tracks**:

| Track | Description |
|---|---|
| Frontend Development | HTML, CSS, JavaScript, React & modern UI frameworks |
| Backend Development | APIs, databases, server-side logic & system design |
| Data Science & ML | Machine learning, statistics, Python & data analysis |
| DevOps & Cloud | CI/CD, containers, Kubernetes, AWS/GCP & infrastructure |
| Cybersecurity | Network security, ethical hacking, threats & defense |
| UI/UX Design | User research, wireframing, Figma & design systems |
| Mobile Development | React Native, Flutter, iOS/Android fundamentals |
| Databases | SQL, NoSQL, schema design, query optimization |

**Level 1 — Quiz**
- 8 multiple-choice questions on core concepts of the chosen track
- Pass mark: 60% (5/8 correct)
- Tracks which categories you answered incorrectly (used for weak-topic identification)
- After passing, you may view results showing **course recommendations** tailored to your score and weak areas

**Level 2 — Practical Task**
- Upload a work sample file (code, notebook, SQL script, PDF, etc.)
- Accepted formats vary by track (e.g., `.py`, `.ipynb`, `.sql`, `.js`, `.pdf`, `.zip`)
- The system scores your submission across 3 dimensions: Setup/Dataset Handling (15 pts), Methodology/Implementation (20 pts), Results/Quality (15 pts) — total 50 pts
- Keyword analysis against the track's expected concepts determines the score
- Pass mark: 60% (30/50 points)
- After passing, results show **coding practice platforms** (LeetCode, NeetCode, GeeksforGeeks, CodeChef, Codeforces, HackerRank)

**Level 3 — Interview Questions**
- 5 written interview questions tailored to the chosen skill track
- Answers can be typed **or recorded using the browser microphone** (Web Speech API)
- Word count is displayed per answer
- Scored based on keyword coverage across expected concepts for each question
- After completing, results show **mock interview platforms** (Pramp, Interviewing.io, Exponent, ExpertHire, Gainlo, HackerRank Interview Prep)

**Results View**
- Score cards for all 3 levels (pass/fail + percentage)
- Bar chart (Score Distribution) and radar chart (Performance Radar) for visual analysis
- Weak topics identified from Level 1 quiz mistakes
- Context-aware recommendations based on the highest level completed:
  - After Quiz → Course recommendations
  - After Practical → Coding practice platforms
  - After Interview Questions → Mock interview platforms
- Users can view partial results at any point after completing at least one level via **"View Current Results"**
- Levels are locked until the previous level is passed (Level 2 requires Level 1 pass, Level 3 requires Level 2 pass)
- All levels can be retaken

---

### 4. Course Explorer (Courses Page)

- 8 learning platforms with 15 curated topics each (120 topics total)

| Platform | Focus Area |
|---|---|
| Coursera | Data Science, AI, Cloud, Web Dev, Cybersecurity |
| Udemy | React, Full Stack, AWS, DevOps, JavaScript |
| Simplilearn | PMP, Data Analytics, Cloud Architecture, Agile |
| Great Learning | AI Engineering, Data Engineering, Product Management |
| upGrad | MBA, Data Science Bootcamp, Fintech, UI/UX |
| edX | Computer Science, Quantum Computing, Robotics, IoT |
| Pluralsight | .NET, Infrastructure as Code, Terraform, System Design |
| LinkedIn Learning | Leadership, Career Planning, Soft Skills, Excel |

- Topics are color-coded by **6 categories**: Technology, Business, Data & AI, Design, Cloud, Soft Skills
- **Live search** filters topics across all platforms simultaneously
- Clicking any topic badge **opens the platform's search results** for that topic in a new tab
- All topic clicks are logged to your activity history

---

### 5. Profile Page

- Displays your **name** (parsed from resume), file name, and avatar initials
- Shows all parsed resume sections with icons:
  - Skills (as badges)
  - Education
  - Experience
  - Projects
  - Certifications & Courses
  - Languages
  - Extracurricular & Activities
- Falls back to full raw extracted text if section headers are not detected in the resume
- Shows your **top AI job match** from upload with compatibility percentage
- Displays a **summary table** of all job match scores
- Contains a chronological **activity log** showing:
  - Career searches (with location if specified)
  - Course topics clicked
  - Assessment levels completed (with pass/fail and score)
- **Sign Out** button clears all session data and redirects to home

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │               React SPA (Vite)                     │    │
│  │                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │    │
│  │  │  Career  │  │ Courses  │  │    Assessment    │ │    │
│  │  │   Page   │  │   Page   │  │      Page        │ │    │
│  │  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │    │
│  │       │              │                  │           │    │
│  │  ┌────▼──────────────▼──────────────────▼─────────┐│    │
│  │  │              UserContext (React Context)        ││    │
│  │  │         sessionStorage ← profile + activity    ││    │
│  │  └───────────────────────────────────────────────┘│    │
│  └────────────────────────┬───────────────────────────┘    │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼────────────────────────────────┐
│                    Express Server (Node.js)                  │
│                                                             │
│   /api/jobs  →  tavilyJobs.ts  →  Tavily Search API         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────────┐
          │                                          │
          ▼                                          ▼
 ┌─────────────────┐                    ┌──────────────────────┐
 │   Tavily API    │                    │  n8n Webhook         │
 │  (Live job      │                    │  (Resume AI analysis │
 │   listings)     │                    │   + job matching)    │
 └─────────────────┘                    └──────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework with hooks |
| **TypeScript** | Type safety across the frontend |
| **Vite** | Build tool and dev server with HMR |
| **Wouter** | Lightweight client-side routing |
| **TanStack Query v5** | Server state management and data fetching |
| **shadcn/ui** | Pre-built accessible UI components (Radix UI based) |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |
| **Recharts** | Bar charts and radar charts in Assessment results |
| **pdfjs-dist** | Client-side PDF text extraction |
| **react-hook-form** | Form state management |
| **Zod** | Schema validation |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express.js** | HTTP server and API routing |
| **TypeScript** | Type safety on the server |
| **tsx** | TypeScript execution for development |
| **Drizzle ORM** | Database schema definitions and query builder |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Replit** | Hosting, secrets management, deployment |

---

## Integrations & External Services

### 1. Tavily Search API
- **What it does**: Powers the live job search on the Career page
- **How it works**: The frontend sends a query to `/api/jobs` on the Express server. The server calls the Tavily API with the search term, location, job type, and experience filters and returns formatted job listings.
- **Configuration**: Requires `TAVILY_API_KEY` environment variable on the server
- **File**: `server/tavilyJobs.ts`

### 2. n8n Automation Webhook
- **What it does**: Receives the uploaded resume, runs AI analysis, and returns job matches
- **How it works**: The frontend converts the uploaded file to Base64 and POSTs it to the n8n webhook endpoint. The n8n workflow processes the resume using an AI model and responds with a JSON object containing matched job roles and scores.
- **Webhook URL**: `https://n8n-production-6a89.up.railway.app/webhook/resume-upload`
- **Request format**:
  ```json
  {
    "fileName": "resume.pdf",
    "fileBase64": "<base64-encoded file content>"
  }
  ```
- **Response format**:
  ```json
  {
    "total_jobs_analyzed": 25,
    "top_matches": [
      {
        "job_title": "Data Scientist",
        "match_percentage": 87,
        "required_skills_present": ["Python", "SQL", "Machine Learning"],
        "skill_gaps": ["Spark", "Kubernetes"],
        "overall_assessment": "Strong match with relevant experience."
      }
    ]
  }
  ```
- **File**: `client/src/components/ResumeUpload.tsx`

### 3. pdfjs-dist (PDF.js)
- **What it does**: Extracts raw text from uploaded PDF files entirely in the browser
- **How it works**: The uploaded file is read as an ArrayBuffer, passed to PDF.js, and text content is extracted page by page. The extracted text is then parsed into sections (Skills, Education, Experience, Projects, Certifications, Languages, Extracurricular)
- **Worker**: Loaded from CDN — `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/<version>/pdf.worker.min.js`
- **File**: `client/src/lib/resumeParser.ts`

### 4. Web Speech API (Voice Recording)
- **What it does**: Converts spoken answers into text during Level 3 (Interview Questions) of the assessment
- **How it works**: Uses the browser's built-in `SpeechRecognition` API. If the browser does not support it, a clear error message is shown and the user can type instead.
- **No external service required** — runs entirely in the browser

---

## Frontend Structure

### Routing (`client/src/App.tsx`)
```
/              → Home (landing page, resume upload)
/career        → Career (live job search) [protected]
/courses       → Courses (course explorer) [protected]
/assessment    → Assessment (skill assessments) [protected]
/profile       → Profile (resume, matches, activity) [protected]
```

Protected routes redirect to `/` if no user profile is present in context.

### State Management (`client/src/context/UserContext.tsx`)
The `UserContext` is the central state store for the session:

```typescript
interface UserProfile {
  fileName: string;           // name of uploaded file
  sections: ResumeSections;   // parsed resume sections
  jobMatches: JobMatch[];     // AI-returned job match results
  totalJobsAnalyzed: number;  // number of roles analyzed
}

interface ActivityEntry {
  type: "career_search" | "course_click" | "assessment_result";
  timestamp: number;
  label: string;
  detail?: string;
}
```

- Stored in `sessionStorage` under keys `careerPilot_profile` and `careerPilot_activity`
- Automatically hydrated on page reload (within the same tab/session)
- Cleared on tab close (sessionStorage behavior) or manual sign-out

### Resume Parser (`client/src/lib/resumeParser.ts`)
- Accepts PDF or TXT files
- PDF files are processed using `pdfjs-dist` to extract text content
- Text is split into sections using regex-based header detection (Skills, Education, Experience, Projects, Certifications, Languages, Extracurricular)
- Name is guessed from the first few lines using a capitalization heuristic
- If fewer than 3 skills are parsed, they are supplemented from the AI job match results

---

## Backend Structure

### Entry Point (`server/index.ts`)
Starts the Express server and serves the Vite-built frontend in production, or Vite middleware in development. Both run on port **5000**.

### Routes (`server/routes.ts`)
Registers all API routes:
- `GET /api/jobs` → proxies job search to Tavily API

### Job Search Service (`server/tavilyJobs.ts`)
- Receives query parameters: `search`, `location`, `jobType`, `experienceLevel`
- Builds a natural-language query for Tavily
- Calls Tavily's search endpoint with the `TAVILY_API_KEY`
- Parses and formats results into a consistent job listing structure including:
  - Title, company, location, job type, experience level
  - Salary range (handles USD ranges and Indian LPA values, converting LPA to full rupee amounts)
  - Description snippet and apply URL
- Falls back to an empty result set on API errors

### Storage (`server/storage.ts`)
Implements an in-memory storage interface (`MemStorage`). Currently used minimally — no persistent user data is stored server-side by design.

### Shared Schema (`shared/schema.ts`)
Drizzle ORM schema definitions shared between frontend and backend for type safety. Includes Zod schemas generated via `drizzle-zod`.

---

## Data Flow & Workflow

### Resume Upload Flow
```
User selects file
        │
        ▼
ResumeUpload.tsx
        │
        ├── convertToBase64(file)
        │
        ├── POST → n8n webhook (base64 resume)
        │         └── returns { top_matches, total_jobs_analyzed }
        │
        ├── extractTextFromFile(file) via pdfjs-dist
        │         └── returns raw text string
        │
        ├── parseResumeSections(rawText)
        │         └── returns { name, skills, education, experience, ... }
        │
        ├── setProfile({ fileName, sections, jobMatches, ... })
        │         └── stored in UserContext + sessionStorage
        │
        └── Display results modal → navigate to /career?search=<top match>
```

### Job Search Flow
```
User types search term + filters
        │
        ▼
Career.tsx → useQuery({ queryKey: ['/api/jobs', params] })
        │
        ▼
TanStack Query → GET /api/jobs?search=...&location=...&jobType=...
        │
        ▼
Express server → tavilyJobs.ts → Tavily API
        │
        ▼
Job listings rendered as cards with salary, apply link, badges
```

### Assessment Flow
```
User selects skill track
        │
        ▼
Level 1 (Quiz) → handleQuizSubmit() → score → logActivity()
        │ pass (≥60%)
        ▼
Level 2 (Practical) → handleLevel2Submit() → keyword matching → score → logActivity()
        │ pass (≥60%)
        ▼
Level 3 (Interview Questions) → handleLevel3Submit() → keyword matching → score → logActivity()
        │
        ▼
Results view with context-aware recommendations:
  - After Level 1 → Course recommendations (Coursera, Udemy, edX, etc.)
  - After Level 2 → Coding practice platforms (LeetCode, NeetCode, GFG, etc.)
  - After Level 3 → Mock interview platforms (Pramp, Interviewing.io, etc.)
```

---

## Authentication & Session Model

CareerPilot uses a **no-account, session-based model**:

| Aspect | Detail |
|---|---|
| **Auth gate** | Resume upload on `/` — must upload before accessing other pages |
| **Session storage** | Browser `sessionStorage` (not `localStorage`) |
| **Session keys** | `careerPilot_profile`, `careerPilot_activity` |
| **Session lifetime** | Ends when the browser tab is closed |
| **Sign out** | Manually clears sessionStorage and resets context; redirects to `/` |
| **Server-side storage** | None — no user data is persisted on the server |
| **Protected routes** | `/career`, `/courses`, `/assessment`, `/profile` redirect to `/` if no profile |

---

## Pages & Components

### Pages
| File | Route | Description |
|---|---|---|
| `pages/Home.tsx` | `/` | Landing page — hero, about, upload, features, FAQ, footer |
| `pages/Career.tsx` | `/career` | Live job search with Tavily API |
| `pages/Courses.tsx` | `/courses` | Course topic explorer by platform |
| `pages/Assessment.tsx` | `/assessment` | Three-level skill assessment system (8 tracks) |
| `pages/Profile.tsx` | `/profile` | User profile, resume sections, job matches, activity log |

### Key Components
| File | Description |
|---|---|
| `components/Navigation.tsx` | Sticky header; shows nav links and profile dropdown only when logged in |
| `components/Hero.tsx` | Landing page hero with animated background and CTA button |
| `components/ResumeUpload.tsx` | File upload gate with pipeline overlay, results modal, and profile setup |
| `components/AboutSection.tsx` | Landing page about section |
| `components/Features.tsx` | Feature cards explaining what CareerPilot does |
| `components/FAQ.tsx` | Accordion FAQ section |
| `components/Footer.tsx` | Footer with contact info and data privacy note |
| `context/UserContext.tsx` | Global session state, profile, activity log |
| `lib/resumeParser.ts` | PDF/TXT extraction and section parsing |

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `TAVILY_API_KEY` | Server (Replit Secret) | API key for the Tavily job search service |

No other server-side environment variables are required. The n8n webhook URL is hardcoded in `ResumeUpload.tsx`.

---

## Running Locally

The project uses a single `npm run dev` command that starts both the Express backend and the Vite frontend dev server on **port 5000**.

```bash
# Install dependencies
npm install

# Set environment variable
export TAVILY_API_KEY=your_key_here

# Start dev server
npm run dev
```

Visit `http://localhost:5000` in your browser.

**Production build:**
```bash
npm run build    # builds client to dist/public, bundles server to dist/index.js
npm start        # serves production build
```

---

## Project Structure

```
career-pilot/
├── client/
│   └── src/
│       ├── components/
│       │   ├── ui/                   # shadcn/ui base components
│       │   ├── Navigation.tsx        # Sticky nav bar
│       │   ├── Hero.tsx              # Landing hero section
│       │   ├── ResumeUpload.tsx      # Upload gate + results modal
│       │   ├── Features.tsx          # Feature explanations
│       │   ├── AboutSection.tsx      # About blurb
│       │   ├── FAQ.tsx               # FAQ accordion
│       │   └── Footer.tsx            # Footer + contact
│       ├── context/
│       │   └── UserContext.tsx       # Session state (profile + activity)
│       ├── lib/
│       │   ├── resumeParser.ts       # PDF/TXT extraction + section parser
│       │   └── queryClient.ts        # TanStack Query client
│       ├── pages/
│       │   ├── Home.tsx              # Landing page
│       │   ├── Career.tsx            # Live job search
│       │   ├── Courses.tsx           # Course explorer
│       │   ├── Assessment.tsx        # Skill assessments (8 tracks, 3 levels)
│       │   ├── Profile.tsx           # User profile
│       │   └── not-found.tsx         # 404 page
│       └── App.tsx                   # Router + UserProvider
├── server/
│   ├── index.ts                      # Express entry point
│   ├── routes.ts                     # API route registration
│   ├── tavilyJobs.ts                 # Tavily API integration + salary parser
│   ├── storage.ts                    # In-memory storage (IStorage)
│   └── vite.ts                       # Vite dev middleware
├── shared/
│   └── schema.ts                     # Drizzle schema + Zod types
├── public/                           # Static assets
├── attached_assets/                  # Generated images used in the UI
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── drizzle.config.ts
```

---

## Key Design Decisions

- **No user accounts**: CareerPilot is intentionally account-free. The resume upload acts as the authentication gate, and all data lives in `sessionStorage`. This reduces friction and avoids storing sensitive personal data on servers.
- **Client-side PDF parsing**: PDF text extraction happens entirely in the browser using `pdfjs-dist`, so resume content is never sent to our own server — only to the n8n AI webhook for job matching.
- **n8n for AI processing**: Using n8n as the AI orchestration layer keeps the main Express server lightweight and allows the AI matching logic to be updated independently.
- **Tavily for live job data**: Rather than maintaining a database of job listings, CareerPilot uses Tavily to fetch current, real-world listings at query time — ensuring results are always fresh.
- **sessionStorage over localStorage**: Ensures user data is automatically cleared when the browser tab is closed, providing better default privacy.
- **Context-aware assessment recommendations**: Instead of always showing course links after assessments, the results page adapts — showing courses after the quiz (for learning), coding practice platforms after the practical task (for hands-on improvement), and mock interview platforms after the interview questions (for real-world readiness).
- **Keyword-based assessment scoring**: The practical and interview question levels use keyword matching rather than AI inference, keeping the assessment fast, offline-capable, and transparent. The quiz uses fixed correct answers for objective scoring.
