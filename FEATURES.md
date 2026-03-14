# CareerPilot — Complete Feature Guide

This document is a full walkthrough of every feature in CareerPilot. It covers every page, every interaction, every setting, and every edge case in the application.

---

## Table of Contents

1. [Getting Started — Resume Upload](#1-getting-started--resume-upload)
2. [Navigation & Session Management](#2-navigation--session-management)
3. [Career Page — Live Job Search](#3-career-page--live-job-search)
4. [Assessment Page — Skill Evaluation System](#4-assessment-page--skill-evaluation-system)
5. [Courses Page — Learning Platform Explorer](#5-courses-page--learning-platform-explorer)
6. [Profile Page](#6-profile-page)
7. [Home Page Sections](#7-home-page-sections)
8. [Privacy & Data Model](#8-privacy--data-model)

---

## 1. Getting Started — Resume Upload

The resume upload is the entry point to CareerPilot. You must complete it before any other page is accessible.

### Supported File Formats
- **PDF** (`.pdf`) — recommended; full text extraction using PDF.js
- **Plain Text** (`.txt`) — also supported with direct text parsing

### File Size Limit
- Maximum **10 MB** per file

### How to Upload
1. Open the home page (`/`)
2. Scroll to the **"Get Your Career Insights"** section or use the "Get Started" button in the hero
3. Either **drag and drop** your resume file onto the upload area, or click the upload area to open a file picker
4. Once a file is selected it is immediately submitted — no extra confirm step

### What Happens During Upload (5-Step Pipeline)

An animated pipeline overlay appears while the analysis runs. Each step lights up in sequence:

| Step | What it does |
|---|---|
| 1. Reading Resume | PDF text is extracted page-by-page in the browser using PDF.js (for PDFs) or read directly (for TXT) |
| 2. Parsing Sections | Raw text is split into named sections: Skills, Education, Experience, Projects, Certifications, Languages, Extracurricular |
| 3. Analyzing with AI | The file is Base64-encoded and sent to the n8n AI webhook for job role matching |
| 4. Matching Jobs | The AI response returns a list of ranked job roles with compatibility scores |
| 5. Building Profile | Your profile is assembled from the parsed sections and AI results, then saved to sessionStorage |

### Error Handling
- If the n8n webhook fails or times out, the app falls back to constructing your profile from the locally parsed resume text only (no job matches shown)
- If section headers are not detected in your resume, the full raw extracted text is shown as a fallback on the Profile page

### Results Modal

After the upload completes, a **Results Modal** appears showing:
- Total number of job roles analyzed
- A grid of job match cards, each showing:
  - Job title
  - **Compatibility percentage** (e.g., 87%)
  - A progress bar representing match strength
  - Skills already in your resume that are relevant to the role
  - Skill gaps — skills the role requires that were not found in your resume
  - An overall assessment blurb from the AI
- The best-matching role is marked with a **"Top Match" badge**
- A **"View Job Openings"** button that closes the modal and navigates to the Career page with your top match pre-filled in the search

### Re-uploading
- You can upload a new resume at any time from the home page
- This replaces your current session profile with the new upload's results

---

## 2. Navigation & Session Management

### Navigation Bar
The navigation bar is **sticky** (always visible at the top of the page). Its content changes based on whether you are logged in.

**Before upload (no profile):**
- CareerPilot logo/name only — no page links are shown

**After upload (profile exists):**
- CareerPilot logo (links to home)
- Career
- Courses
- Assessment
- Profile (dropdown button showing your avatar initials)

### Profile Dropdown
Clicking the avatar initials button in the nav opens a dropdown with:
- Your name (or filename if name could not be parsed)
- A **"Sign Out"** option

### Sign Out
- Clears all data from `sessionStorage`
- Resets the React context (profile and activity log)
- Redirects you to the home page (`/`)
- Navigation links disappear again until a new resume is uploaded

### Protected Routes
All pages except the home page (`/`) are protected. If you try to navigate to `/career`, `/courses`, `/assessment`, or `/profile` without a profile, you are automatically redirected to `/`.

---

## 3. Career Page — Live Job Search

The Career page searches for real, current job listings using the **Tavily Search API**.

### Auto-Search on Arrival
When you navigate to the Career page directly after uploading your resume (via "View Job Openings"), the **top AI-matched job title** is automatically pre-filled and searched for you — no manual typing required.

### Search Bar
- Type any **job title, skill, or keyword** (e.g., "React Developer", "Machine Learning Engineer", "Python")
- Press **Enter** or click the search button to run the search
- Each new search triggers a fresh API call

### Filters
Three filters are available alongside the search bar:

| Filter | Options |
|---|---|
| **Location** | Free-text field — type any city, country, or "remote" |
| **Job Type** | All, Full-time, Part-time, Contract, Internship |
| **Experience Level** | All, Entry Level, Mid Level, Senior Level |

Filters are applied on each search submission. Changing a filter does not auto-search — you need to click the search button.

### Job Result Cards

Each job card displays:
- **Job Title** (large, prominent)
- **Company name**
- **Location** (city, country, or "Remote")
- **Job Type badge** (Full-time, Part-time, etc.)
- **Experience Level badge**
- **Salary range** (when available):
  - USD: shown as `$80,000 – $120,000` or `Up to $150,000`
  - Indian salaries: converted from LPA to full rupees (e.g., "12 LPA" → `₹1,200,000`)
  - If no salary is available, the salary section is hidden entirely
- **Description** — a snippet of the job posting content
- **Apply Now** button — opens the original job listing in a new browser tab

### Loading & Empty States
- A loading spinner is shown while results are being fetched
- If no results are found for the search query, a clear "no results" message is shown with the search terms used
- Results are cached by TanStack Query — repeating the same search does not trigger a new API call

### Activity Logging
Every search is automatically logged to your activity history with the search term and location (if specified).

---

## 4. Assessment Page — Skill Evaluation System

The Assessment page is a structured three-level evaluation system. Each level builds on the previous one and must be passed (60% or above) before the next level unlocks.

### Step 1 — Choose a Skill Track

Eight skill tracks are available:

| Track | What it covers |
|---|---|
| **Frontend Development** | HTML, CSS, JavaScript, React, accessibility, performance, modern UI frameworks |
| **Backend Development** | REST APIs, Node.js, databases, authentication, caching, system design, microservices |
| **Data Science & ML** | Machine learning algorithms, statistics, Python, pandas, model evaluation, feature engineering |
| **DevOps & Cloud** | CI/CD pipelines, Docker, Kubernetes, Terraform, AWS/GCP, monitoring, infrastructure as code |
| **Cybersecurity** | Network security, ethical hacking, OWASP, cryptography, incident response, threat modeling |
| **UI/UX Design** | User research, wireframing, Figma, design systems, usability testing, accessibility |
| **Mobile Development** | React Native, Flutter, iOS/Android fundamentals, app store deployment, push notifications |
| **Databases** | SQL, NoSQL, normalization, ACID, indexing, query optimization, sharding, migrations |

Click a track card and then "Start Assessment" to begin.

---

### Assessment Dashboard

After selecting a track, you land on the **Assessment Dashboard** showing:
- Your chosen skill track name and icon in the top bar
- A 3-step progress indicator showing which levels are locked, in-progress, passed, or failed
- Three level cards (Level 1, Level 2, Level 3)
- A **"View Current Results"** button (visible once at least one level has been completed)
- A **"Change Skill"** button to go back and pick a different track (resets all progress)

**Level locking rules:**
- Level 1 is always unlocked
- Level 2 unlocks only after Level 1 is passed
- Level 3 unlocks only after Level 2 is passed
- All levels can be retaken at any time once unlocked

---

### Level 1 — Easy Quiz

**Purpose:** Test your conceptual knowledge of the skill track.

**Format:**
- 8 multiple-choice questions
- Each question has 4 options; exactly one is correct
- Questions cover a range of categories within the track (e.g., for Frontend: JavaScript, CSS, Accessibility, Performance, etc.)

**How it works:**
1. Click "Start Quiz" on the Level 1 card
2. Questions appear one at a time with a progress bar
3. Select an answer using the radio-style option buttons
4. Navigate back and forward with "Previous" / "Next" buttons
5. The "Submit Quiz" button becomes active only when all 8 questions have been answered
6. Your answers are evaluated immediately on the client side

**Scoring:**
- Each correct answer = 1 point out of 8
- Score displayed as a percentage: `(correct / 8) × 100`
- Pass mark: **60%** (5 or more correct)

**After submitting:**
- You are returned to the Assessment Dashboard
- The Level 1 card shows your score and pass/fail status
- Weak topic categories (categories where you answered incorrectly) are saved for the results view
- If you failed, the button shows "Retry" — there is no cooldown or attempt limit

**What you can view:**
- After passing Level 1, you can click "View Current Results" to see a results page with your quiz score and **course recommendations** tailored to your weak topics and overall score

---

### Level 2 — Practical Task

**Purpose:** Evaluate your hands-on, applied ability in the skill track.

**Format:**
- A specific coding or technical task description is shown
- You complete the task in your own environment and upload a file

**How it works:**
1. Click "Start Task" on the Level 2 card (only available after passing Level 1)
2. Read the task description and the list of required steps
3. Complete the task in your own tools (IDE, Jupyter Notebook, SQL client, etc.)
4. Click "Choose File" to select your submission file
5. Click "Submit for Evaluation"
6. A 2-second evaluation animation plays while scoring runs

**Accepted file formats vary by track.** Examples:
- Frontend / Backend / Mobile: `.js`, `.ts`, `.jsx`, `.tsx`, `.zip`
- Data Science: `.py`, `.ipynb`, `.zip`
- Databases: `.sql`, `.pdf`, `.zip`, `.png`
- DevOps / Cloud: `.yml`, `.yaml`, `.zip`, `.md`
- Cybersecurity / UI/UX: `.pdf`, `.zip`, `.md`

**Scoring (50 points total):**
| Dimension | Max Points | What it checks |
|---|---|---|
| Setup / Dataset Handling | 15 | Correct initialization, data structures, or environment setup |
| Methodology / Implementation | 20 | Core logic, approach, and technical accuracy |
| Results / Quality | 15 | Output quality, completeness, and best practices |

- Scoring is based on **keyword analysis**: the system checks your file's text content against a list of expected technical keywords for that track
- Binary files (PDFs, ZIPs) and unreadable formats receive a general score based on file presence
- Pass mark: **60%** (30 or more points out of 50)
- Detailed breakdown showing points per dimension is always displayed after evaluation

**After submitting:**
- If you pass: "Continue to Next Level" button returns you to the dashboard with Level 3 unlocked
- If you fail: An error message explains the mismatch (how many keywords matched), and a "Try Again" button lets you re-upload a different file — there is no attempt limit
- If you pass Level 2 and then click "View Current Results", the results page will show **coding practice platforms** instead of courses

---

### Level 3 — Interview Questions

**Purpose:** Assess your ability to communicate technical concepts as you would in a real interview.

**Format:**
- 5 open-ended interview questions tailored to the chosen skill track
- Each question tests a distinct concept (e.g., for Databases: indexes, query optimization, NoSQL vs SQL, schema design, zero-downtime migrations)

**How it works:**
1. Click "Start" on the Level 3 card (only available after passing Level 2)
2. All 5 questions are shown on a single scrollable page
3. For each question, you can either:
   - **Type your answer** in the text area (no minimum word count)
   - **Record your answer using the microphone** — click "Record Answer" to start, click "Stop Recording" when done. The transcribed text is automatically placed in the text area.
4. Word count is shown live below each answer
5. The "Submit Answers" button activates only when all 5 questions have at least one character in the answer field

**Voice recording notes:**
- Uses the browser's built-in Web Speech API (no external service)
- Works best in Chrome and Edge
- If your browser does not support speech recognition, a clear error message is shown — you can still type your answers
- The microphone button turns red and animates while recording is active
- After stopping, the recorded text is appended to whatever was already in the text area

**Scoring:**
- Each answer is checked against a list of expected keywords for that specific question
- Keyword hit rate determines your score per question
- Final score is the average across all 5 questions, expressed as a percentage
- There is no strict pass/fail threshold for Level 3 — it is treated as **always complete** (you can view results regardless of score)

**After submitting:**
- You are automatically redirected to the **Results View**
- Results show your score for all three levels plus the mock interview platform recommendations

---

### Results View

The Results View is a comprehensive performance analysis page. It can be accessed:
- Automatically after submitting Level 3
- Manually at any time (after completing at least one level) via the "View Current Results" button on the dashboard

**What the Results View shows:**

**Score Cards (top row):**
- Level 1: Quiz — score % and Passed/Failed badge
- Level 2: Practical — score % and Passed/Failed badge
- Level 3: Interview Questions — score % and Complete badge

**Charts (visualizations):**
- **Score Distribution** — a bar chart comparing your scores across all 3 levels
- **Performance Radar** — a radar/spider chart with axes for Quiz, Practical, and Interview Questions

**Areas for Improvement:**
- Only shown if you got any quiz questions wrong
- Displays the topic categories where you made mistakes as yellow badge tags

**Context-Aware Recommendations (bottom section):**
The recommendation section shown depends on the highest level you have completed:

| Highest level completed | What is shown |
|---|---|
| Level 1 (Quiz) only | Course recommendations from Coursera, Udemy, edX, etc. — tailored to your score level (Beginner if low score, Intermediate or Advanced if high score) |
| Level 2 (Practical) completed | 6 coding practice platforms with direct links |
| Level 3 (Interview Questions) completed | 6 mock interview platforms with direct links |

**Coding Practice Platforms (shown after Level 2):**
| Platform | Best for |
|---|---|
| LeetCode | General coding interview prep — thousands of problems |
| NeetCode | Structured roadmaps with video walkthroughs |
| GeeksforGeeks | Problem of the Day + CS tutorials and interview experiences |
| CodeChef | Competitive programming contests and practice |
| Codeforces | Rated competitive programming contests |
| HackerRank | Structured learning paths by domain |

**Mock Interview Platforms (shown after Level 3):**
| Platform | Best for |
|---|---|
| Pramp | Free peer-to-peer mock interviews |
| Interviewing.io | Anonymous interviews with engineers from top tech companies |
| Exponent | Engineering, product, and PM mock interviews with video |
| ExpertHire | 1-on-1 sessions with industry experts |
| Gainlo | Mock interviews focused on FAANG-style questions |
| HackerRank Interview Prep | Structured interview preparation kit |

All recommendation cards include a name, badge, description, and a button that opens the platform in a new tab.

**"Back to Assessment"** button returns you to the dashboard to continue or retry any level.

---

## 5. Courses Page — Learning Platform Explorer

The Courses page is a curated library of 120 learning topics across 8 major platforms.

### Platforms and Topics

| Platform | Topics | Color theme |
|---|---|---|
| **Coursera** | Data Science, Machine Learning, Web Development, AI, Cloud Computing, Cybersecurity, Python, Digital Marketing, Project Management, Business Analytics, UX Design, Mobile Development, Deep Learning, DevOps, Blockchain | Blue |
| **Udemy** | React Development, Node.js, AWS Certification, Docker & Kubernetes, Full Stack Development, Ethical Hacking, Photography, Excel Mastery, SQL Databases, Graphic Design, JavaScript, Angular, Game Development, Leadership Skills, Public Speaking | Purple |
| **Simplilearn** | PMP Certification, Data Analytics, Cloud Architecture, Agile & Scrum, Six Sigma, Salesforce, Big Data, Azure DevOps, ITIL Certification, Quality Assurance, Tableau, Power BI, Java Programming, ServiceNow, Network Security | Orange |
| **Great Learning** | AI Engineering, Data Engineering, Software Development, Business Intelligence, Machine Learning Operations, Computer Vision, NLP, Cloud Solutions, Product Management, Finance Analytics, Marketing Analytics, HR Analytics, Automation Testing, Backend Development, Frontend Development | Green |
| **upGrad** | MBA Programs, Data Science Bootcamp, Digital Transformation, Full Stack Engineering, Product Design, Fintech, Healthcare Management, Supply Chain Management, Entrepreneurship, Investment Banking, AI & ML, Cyber Security, Blockchain Development, UI/UX Design, Content Writing | Red |
| **edX** | Computer Science, Microservices, Quantum Computing, Robotics, IoT, Economics, Statistics, Python for Data Science, R Programming, Mobile App Development, Software Engineering, Information Security, Business Strategy, Communication Skills, Critical Thinking | Indigo |
| **Pluralsight** | .NET Development, C# Programming, Infrastructure as Code, Terraform, Jenkins CI/CD, Microservices Architecture, API Development, Security Engineering, Git & GitHub, Vue.js, TypeScript, Azure Cloud, Google Cloud Platform, Monitoring & Logging, System Design | Pink |
| **LinkedIn Learning** | Leadership Development, Career Planning, Time Management, Excel for Business, Presentation Skills, Negotiation Skills, Remote Work, Team Management, Strategic Thinking, Customer Service, Sales Skills, Emotional Intelligence, Productivity, Personal Branding, Networking | Dark Blue |

### Topic Categories
Topics are color-coded to indicate their category at a glance:
- **Technology** — Blue badges
- **Business** — Purple badges
- **Data & AI** — Green badges
- **Design** — Pink badges
- **Cloud** — Cyan badges
- **Soft Skills** — Yellow badges

A legend at the bottom of the page shows all category colors.

### Search / Filter
- A search bar at the top filters topics **across all platforms simultaneously** as you type
- Only platform cards with matching topics remain visible
- A live counter shows how many topics match across how many platforms
- If no topics match, a "no results" message is shown

### Opening a Course
- Click any topic badge to open the platform's **search results page** for that topic in a new tab
- You are taken directly to the platform with the topic pre-searched (e.g., clicking "React Development" on Udemy opens `https://www.udemy.com/courses/search/?q=react+development`)
- The click is logged to your activity history with the topic name and platform name

### Course Recommendations in Assessment
The Courses page is separate from the course recommendations shown in Assessment results. Assessment results show a curated subset of 2–4 specific course recommendations per skill track, also using the same platform links.

---

## 6. Profile Page

The Profile page is a dashboard showing everything CareerPilot knows about you from this session.

### Identity Section
- **Avatar**: A colored circle with your initials (derived from your parsed name, or your filename if a name could not be found)
- **Name**: Parsed from the top of your resume using capitalization detection
- **File Name**: The name of the file you uploaded (e.g., `john_doe_resume.pdf`)

### Skills Section
- Displayed as individual badge chips
- Sourced from the "Skills" section of your parsed resume
- If fewer than 3 skills were found in the resume text, they are supplemented from the matched job roles in the AI results

### Resume Sections
Displayed as expandable content blocks, each with an icon:
- **Education** — degrees, institutions, graduation years
- **Experience** — job history, companies, roles, dates
- **Projects** — personal or professional projects
- **Certifications & Courses** — professional certifications
- **Languages** — spoken/written languages
- **Extracurricular & Activities** — clubs, volunteering, hobbies

If none of these sections could be detected (e.g., a non-standard resume format), the full raw extracted text is shown with a note explaining what happened.

### Job Match Results
- Shows the **top matching role** from your AI analysis with its compatibility percentage and a progress bar
- A **table** lists all matched roles with their percentage scores
- Shows the total number of roles that were analyzed by the AI

### Activity Log
A reverse-chronological log of everything you have done in the current session:
- **Career searches** — each search shows the term used and location (if any)
- **Course topic clicks** — shows which topic was clicked and on which platform
- **Assessment results** — shows which level was completed, pass/fail, and the score

Each log entry shows a relative timestamp (e.g., "just now", "5 min ago").

If no activity has been logged yet, a placeholder message is shown.

### Sign Out
The "Sign Out" button is available on the Profile page (and via the navigation dropdown). It clears all session data and returns you to the home page.

---

## 7. Home Page Sections

The home page (`/`) is visible to all users, logged in or not.

### Hero Section
- Full-screen hero with a subtle animated background
- Headline: "Your Career, Intelligently Guided"
- Subheadline describing the app
- "Get Started" CTA button — scrolls to the resume upload section

### About Section
- A brief description of what CareerPilot does and who it is for

### Feature Cards Section
- Cards summarizing the 4 main features of the app:
  1. AI-powered resume analysis and job matching
  2. Live job search
  3. Skill assessments
  4. Course discovery

### Resume Upload Section
- The main upload widget (drag-and-drop area or file picker)
- Visible and functional even when logged in (allows re-uploading a new resume)
- The section is labeled "Get Your Career Insights" with supporting copy explaining the process

### FAQ Section
- An accordion-style FAQ answering common questions about privacy, what happens to the resume, how job matching works, etc.

### Footer
- Contact information
- A note about data privacy (no data is stored server-side)

---

## 8. Privacy & Data Model

### What data is stored where

| Data | Where it lives | When it is deleted |
|---|---|---|
| Parsed resume sections (name, skills, education, etc.) | Browser `sessionStorage` | When the tab is closed or user signs out |
| AI job match results | Browser `sessionStorage` | When the tab is closed or user signs out |
| Activity log (searches, clicks, assessments) | Browser `sessionStorage` | When the tab is closed or user signs out |
| Assessment progress and scores | React component state (in-memory) | When you navigate away from the Assessment page |
| Resume file content | Sent to n8n webhook as Base64 | Never stored — used for analysis only |
| Resume file content | Processed locally in browser (PDF.js) | Never stored — used for text extraction only |

### What never happens
- Your resume is never stored on CareerPilot's server
- No user accounts are created
- No cookies are set
- No analytics or tracking scripts are used

### Session vs. Local Storage
CareerPilot uses `sessionStorage` (not `localStorage`). This means:
- Your data persists if you refresh the page within the same tab
- Your data is automatically wiped when you close the tab
- Opening the app in a new tab starts a completely fresh session

### n8n Webhook
The resume is sent to an external n8n automation webhook for AI job matching. This is a third-party service. The Base64-encoded resume content is included in the request. Once the n8n workflow returns the analysis results, no copy of the resume is retained by CareerPilot.

---

*This document covers every feature available in CareerPilot as of the current version. For technical implementation details, refer to `README.md`.*
