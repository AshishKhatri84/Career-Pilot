# Resume Matcher Workflow (n8n Automation)

## Overview

This workflow implements an AI-style Resume Matcher system using n8n automation.
It accepts a resume upload through an API, extracts the text, compares it with multiple job descriptions, and returns the top job matches with skill gaps and match percentages.

The workflow simulates an ATS (Applicant Tracking System) style resume analysis pipeline.

---

## Core Pipeline

```
Resume Upload
      ↓
File Processing
      ↓
Text Extraction
      ↓
Resume Processing
      ↓
Job Generation
      ↓
AI Matching
      ↓
Ranking
      ↓
Final Response
```

---

## Workflow Architecture

```
Webhook (Resume Upload)
        │
        ▼
Convert Base64 → Binary
        │
        ▼
File Type Check (IF)
      /   \
     ▼     ▼
PDF Extract   Text Extract
      \       /
       ▼     ▼
        Merge
          │
          ▼
      Set Resume Text
          │
          ▼
      Generate Jobs
          │
          ▼
    Simulated AI Match
          │
          ▼
      Collect Results
          │
          ▼
      Return Results
```

---

## Node-by-Node Explanation

### 1. Resume Upload Webhook

**Node Type:** Webhook

**Purpose:** Acts as the entry point of the workflow and exposes an API endpoint that accepts resume uploads.

**Endpoint:**
```
POST /resume-upload
```

**Expected Request Body:**
```json
{
  "fileBase64": "BASE64_ENCODED_FILE",
  "fileName": "resume.pdf"
}
```

**What it does:**
- Receives resume file in Base64 format
- Allows CORS requests from any origin
- Passes the request data to the next node for processing

**Key Features:**
- REST API endpoint
- Cross-origin enabled
- Accepts file uploads via JSON

---

### 2. Convert Base64 to Binary

**Node Type:** Code Node

**Purpose:** Converts the uploaded file from Base64 format into binary format, which n8n requires for file processing.

**Processing Steps:**

1. Read the Base64 string:
```javascript
const base64 = $json.body.fileBase64;
```

2. Convert Base64 → Buffer:
```javascript
const buffer = Buffer.from(base64, "base64");
```

3. Detect file type — Supported formats: `PDF`, `TXT`

**Output:** Binary file object `binary.data` with metadata: `mimeType`, `fileName`

---

### 3. If Node (File Type Check)

**Node Type:** Conditional (IF)

**Purpose:** Determines which extraction method to use based on file type.

**Condition:** `mimeType == application/pdf`

| Condition | Path |
|-----------|------|
| TRUE | Extract PDF Text |
| FALSE | Extract Text File |

---

### 4. Extract PDF Text

**Node Type:** Extract From File

**Purpose:** Extracts text content from PDF resumes.

**Function:** Uses built-in PDF parser to read binary PDF, extract all textual content, and output as plain text.

**Output Example:**
```json
{
  "text": "Ashish Khatri\nMachine Learning Engineer\nPython TensorFlow..."
}
```

---

### 5. Extract From File (Text)

**Node Type:** Extract From File

**Purpose:** Handles plain text resume files (`.txt`) by extracting readable text directly from the file.

---

### 6. Merge Node

**Node Type:** Merge

**Purpose:** Combines the outputs of PDF text extraction and TXT extraction to ensure the workflow continues with a unified data structure regardless of file type.

---

### 7. Set Resume Text

**Node Type:** Set

**Purpose:** Creates a standardized field for the extracted resume content.

**Transformation:** `text → resumeText`

```json
{
  "resumeText": "Full resume content"
}
```

---

### 8. Generate Jobs

**Node Type:** Code Node

**Purpose:** Generates a list of job roles and descriptions that the resume will be matched against.

**Job Roles Included:**
- Machine Learning Engineer
- Software Engineer
- Frontend Developer
- Backend Developer
- Data Analyst
- DevOps Engineer
- Cybersecurity Analyst
- Cloud Engineer
- Full Stack Developer
- AI Engineer
- Mobile Developer
- QA Engineer
- Database Administrator
- System Engineer
- UI Designer
- Product Manager
- Business Analyst
- Blockchain Developer
- Game Developer
- Research Engineer

**Example Job Object:**
```json
{
  "title": "Machine Learning Engineer",
  "description": "Python machine learning TensorFlow PyTorch pandas numpy modeling"
}
```

**Output:** Each job becomes a separate workflow item.

---

### 9. Simulated AI Match

**Node Type:** Code Node

**Purpose:** Simulates an AI/ATS resume matching algorithm.

**Processing Steps:**

1. **Preprocess Resume:** `resumeText → lowercase`

2. **Extract Keywords From Job Description:**
   - Remove punctuation
   - Split into words
   - Remove stopwords
   - Filter short words

   Example stopwords: `with`, `and`, `the`, `for`, `using`, `looking`, `experience`, `knowledge`

3. **Unique Keyword Extraction:** Use `Set()` to remove duplicates

4. **Skill Matching:** For each keyword:
   - If resume includes keyword → `matched`
   - Else → `missing`

5. **Match Percentage:**
   ```
   percentage = matched_keywords / total_keywords
   ```
   Boundaries: max = 95%, min = 10%

6. **Candidate Assessment:**

| Match % | Result |
|---------|--------|
| 75%+ | Strong candidate |
| 50–74% | Potential fit |
| <50% | Limited match |

**Output Example:**
```json
{
  "job_title": "Backend Developer",
  "match_percentage": 72,
  "required_skills_present": ["node", "mongodb", "apis"],
  "skill_gaps": ["authentication", "caching"],
  "overall_assessment": "Potential fit - recommend phone screen"
}
```

---

### 10. Collect Results

**Node Type:** Code Node

**Purpose:** Aggregates results from all job matches.

**Processing Steps:**
1. Collect all results: `$input.all()`
2. Sort by match percentage (highest → lowest)
3. Select top 4 jobs: `slice(0, 4)`

**Output:**
```json
{
  "total_jobs_analyzed": 20,
  "top_matches": [...]
}
```

---

### 11. Return Results

**Node Type:** Respond to Webhook

**Purpose:** Returns the final API response back to the client.

**Response Format:**
```json
{
  "total_jobs_analyzed": 20,
  "top_matches": [
    {
      "job_title": "Machine Learning Engineer",
      "match_percentage": 88,
      "required_skills_present": ["python", "tensorflow"],
      "skill_gaps": ["pytorch"],
      "overall_assessment": "Strong candidate - recommend interview"
    }
  ]
}
```

---

## Final Output Example

**Top Job Matches:**

1. 🥇 Machine Learning Engineer — 88%
2. 🥈 Data Analyst — 80%
3. 🥉 AI Engineer — 77%
4. 4️⃣ Software Engineer — 71%

**Skill Gaps Identified:**
- Kubernetes
- CI/CD
- AWS

---

## Technologies Used

| Component | Technology |
|-----------|------------|
| Workflow Engine | n8n |
| API Endpoint | Webhook |
| File Processing | NodeJS Buffer |
| PDF Parsing | n8n Extract Node |
| Logic | JavaScript |
| Matching | Keyword Matching Algorithm |

---

## Key Features

- Resume upload API
- PDF / TXT support
- Resume text extraction
- Job database simulation
- ATS-style skill matching
- Skill gap detection
- Match percentage scoring
- Ranked job recommendations

---

## Deployment Journey

The deployment of the Resume Matcher Workflow evolved through multiple stages as we experimented with different infrastructure options to achieve a stable, publicly accessible, and persistent automation environment.

---

### Stage 1 — Local Development with Docker

The project initially started with a local deployment using Docker, which allowed us to run the n8n workflow engine inside a containerized environment.

**Benefits during development:**
- Isolated runtime environment
- Easy dependency management
- Reproducible workflow execution across systems
- Quick container startup and restart

The n8n instance was hosted locally inside the Docker container, enabling us to build and test the workflow logic for resume upload, file processing, text extraction, and job matching.

> **Limitation:** Since the system relies on a webhook API endpoint, the locally hosted workflow could not be accessed externally.

---

### Stage 2 — Temporary Public Access using ngrok

To allow external testing of the webhook endpoint, we introduced **ngrok** — a tool that creates a secure tunnel between the public internet and a local server.

**This allowed us to:**
- Expose the webhook endpoint publicly
- Test API integrations
- Simulate real user resume uploads

**Example flow:**
```
Internet
   │
   ▼
ngrok Public URL
   │
   ▼
Local Machine
   │
   ▼
Docker Container
   │
   ▼
n8n Webhook
```

> **Limitation:** Temporary URLs, session-based tunnels — not suitable for long-term deployment.

---

### Stage 3 — Cloud Deployment Attempt on Render

The next step was deploying the automation workflow on **Render** for permanent public access.

**Render allowed us to:**
- Deploy the automation service online
- Make the webhook endpoint permanently accessible
- Manage the service via cloud infrastructure

> **Critical Issue:** Lack of reliable persistent storage. Service restarts could result in loss of workflow configuration, reset of execution data, and inconsistent workflow state.

---

### Stage 4 — Stable Infrastructure on Railway

To solve the persistent storage issue, we moved the deployment to **Railway**, which offered better support for:

- Persistent storage
- Environment variable management
- Stable backend hosting
- Long-running services

**Result:** Stable workflow execution, persistent data storage, reliable API endpoints, and cloud-based automation processing. This became the core backend infrastructure of the project.

---

### Stage 5 — Frontend Integration via Replit

To provide a user-facing interface, the frontend application was deployed on **Replit**.

**Replit hosted the interface for users to:**
- Upload resumes
- Trigger the webhook workflow
- Receive job matching results

The frontend communicates directly with the Railway-hosted n8n backend through the webhook API.

---

## Final Deployment Architecture

```
User Interface
(Hosted on Replit)
        │
        ▼
Resume Upload Request
        │
        ▼
Railway Cloud Infrastructure
        │
        ▼
n8n Workflow Engine
        │
        ▼
Resume Processing Pipeline
        │
        ├─ File Conversion
        ├─ Text Extraction
        ├─ Job Generation
        ├─ AI Matching
        └─ Result Ranking
        │
        ▼
Response Returned to Frontend
        │
        ▼
Displayed to User
```

---

## Deployment Evolution Overview

```
Stage 1
Local Development
Docker + n8n
      │
      ▼
Stage 2
Temporary Public Access
ngrok Tunnel
      │
      ▼
Stage 3
Cloud Hosting Attempt
Render
(Problem: No persistent storage)
      │
      ▼
Stage 4
Stable Backend Infrastructure
Railway
      │
      ▼
Stage 5
Frontend Integration
Replit
```

This structured deployment process resulted in a stable, scalable architecture capable of handling resume uploads, processing workflows, and returning job match results in real time.
