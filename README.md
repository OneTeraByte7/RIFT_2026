

# 🤖 Autonomous CI/CD Healing Agent

<div align="center">

**RIFT 2026 Hackathon · AI/ML + DevOps Automation + Agentic Systems Track**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Deployed-00d4ff?style=for-the-badge)](https://YOUR_DEPLOYMENT_URL)
[![LinkedIn](https://img.shields.io/badge/🎬_Demo_Video-LinkedIn-0077b5?style=for-the-badge)](https://YOUR_LINKEDIN_VIDEO_URL)
[![GitHub](https://img.shields.io/badge/📦_Source_Code-GitHub-181717?style=for-the-badge)](https://github.com/YOUR_USERNAME/cicd-healing-agent)

> *"Developers spend 40–60% of their time debugging pipeline failures. We built an agent that does it for them — autonomously, surgically, and in under 5 minutes."*

</div>


---

## 🎯 What It Does

The **Autonomous CI/CD Healing Agent** is a full-stack, multi-agent system that:

1. 📥 **Takes a GitHub repository URL** as input via the React dashboard
2. 🔍 **Clones & scans** the entire repository structure automatically
3. 🧪 **Discovers and runs** all test files (pytest, jest, flake8, eslint)
4. 🐞 **Identifies every failure** with exact file, line number, and bug type
5. 🤖 **Uses Gemini AI** to generate precise, minimal code fixes
6. 📝 **Commits each fix** with mandatory `[AI-AGENT]` prefix to a new branch
7. 🔁 **Monitors CI/CD pipeline** and retries automatically up to 5 times
8. 📊 **Displays everything** in a live real-time React dashboard

**The result**: your broken pipeline goes from 🔴 red → 🟢 green, completely hands-free.

---

## 🖼️ Wireframes

### 📟 Screen 1 — Main Dashboard (Desktop View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🤖 Autonomous CI/CD Healing Agent          RIFT 2026 · AI/ML Track   14:32 │
│  Multi-agent · LangGraph · Auto-detect & fix · Push to branch    ● ONLINE   │
│ ─────────────────────────────────────────────────────────────────────────── │
│                                                                              │
│  ┌─────────────────────── AGENT CONFIGURATION ───────────────────────────┐  │
│  │                                                                        │  │
│  │  [ https://github.com/owner/repo     ] [Team Name] [Leader Name]      │  │
│  │                                                                        │  │
│  │  → Branch: TEAM_NAME_LEADER_NAME_AI_Fix                               │  │
│  │                                                                        │  │
│  │  [ ▶ Analyze Repository ]   ● Agent Running · LangGraph pipeline...   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────── RUN SUMMARY ──────────────┐  ┌───── SCORE BREAKDOWN ──────┐  │
│  │  Repo: github.com/owner/repo          │  │         ╭───────╮          │  │
│  │  Branch: TEAM_LEADER_AI_Fix           │  │         │  110  │          │  │
│  │  Team: RIFT | Leader: Saiyam          │  │         │ SCORE │          │  │
│  │                                       │  │         ╰───────╯          │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │  │  Base Score      +100     │  │
│  │  │  12  │ │  12  │ │  3   │ │  4m  │ │  │  Speed Bonus      +10     │  │
│  │  │ FAIL │ │FIXED │ │COMMIT│ │ TIME │ │  │  Efficiency Pen    -0     │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ │  │  ──────────────────────   │  │
│  │                      Status: ✓ PASSED │  │  Final Score       110    │  │
│  └───────────────────────────────────────┘  └────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────── LIVE AGENT LOG ───────────────────────────────┐  │
│  │ ● 14:28:03 › Cloning repository...                                    │  │
│  │   14:28:07 › Found 8 test files                                       │  │
│  │   14:28:09 › Running pytest... 12 failures found                      │  │
│  │   14:28:11 › Gemini fixing src/utils.py (LINTING line 15)...          │  │
│  │   14:28:14 › Committed [AI-AGENT] Fix LINTING...    █                 │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────── FIXES APPLIED ───────────────────────────────┐  │
│  │  [ALL ×12] [LINTING ×4] [SYNTAX ×3] [LOGIC ×2] [TYPE_ERROR ×2] ...   │  │
│  │                                                                        │  │
│  │  FILE               │ BUG TYPE  │ LINE │ COMMIT MESSAGE       │STATUS  │  │
│  │  ──────────────────────────────────────────────────────────────────── │  │
│  │  src/utils.py       │ LINTING   │  15  │ [AI-AGENT] remove…   │  ✓   │  │
│  │  src/validator.py   │ SYNTAX    │   8  │ [AI-AGENT] add co…   │  ✓   │  │
│  │  src/calculator.js  │ LOGIC     │  42  │ [AI-AGENT] fix lo…   │  ✓   │  │
│  │  src/api/handler.py │ TYPE_ERROR│  91  │ [AI-AGENT] fix ty…   │  ✓   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────── CI/CD STATUS TIMELINE ───────────────────────────┐  │
│  │  Iterations used: 3 of 5                                              │  │
│  │                                                                        │  │
│  │  ● Iteration 1  ✗ FAILED   14:28:22                                   │  │
│  │  ● Iteration 2  ✗ FAILED   14:29:14   ████████████░░░░  3/5 used     │  │
│  │  ● Iteration 3  ✓ PASSED   14:30:01                                   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📱 Screen 2 — Dashboard (Mobile View)

```
┌──────────────────────────┐
│  🤖 CI/CD Healing Agent  │
│  ● AGENT ONLINE   14:32  │
│──────────────────────────│
│  AGENT CONFIGURATION     │
│  ┌────────────────────┐  │
│  │ https://github.…  │  │
│  └────────────────────┘  │
│  ┌──────────┐┌─────────┐ │
│  │ Team Name││ Leader  │ │
│  └──────────┘└─────────┘ │
│  Branch:                 │
│  TEAM_LEAD_AI_Fix        │
│  [ ▶ Analyze Repository ]│
│──────────────────────────│
│  RUN SUMMARY             │
│  Status: ✓ PASSED        │
│  ┌──────┐  ┌──────┐      │
│  │  12  │  │  12  │      │
│  │ FAIL │  │FIXED │      │
│  └──────┘  └──────┘      │
│  ┌──────┐  ┌──────┐      │
│  │  3   │  │  4m  │      │
│  │COMMIT│  │ TIME │      │
│  └──────┘  └──────┘      │
│──────────────────────────│
│  SCORE BREAKDOWN         │
│  ╭────── 110 ──────╮     │
│  │   Final Score   │     │
│  ╰─────────────────╯     │
│  Base Score    +100      │
│  Speed Bonus   +10       │
│  Penalty        -0       │
│──────────────────────────│
│  FIXES APPLIED (12)      │
│  src/utils.py  LINTING ✓ │
│  src/valid..   SYNTAX  ✓ │
│  src/calc..    LOGIC   ✓ │
│  [ view all... ]         │
│──────────────────────────│
│  CI/CD TIMELINE  3/5     │
│  ● #1  ✗ FAILED  14:28  │
│  ● #2  ✗ FAILED  14:29  │
│  ● #3  ✓ PASSED  14:30  │
│  ████████░░░░  3 of 5   │
└──────────────────────────┘
```

---

### 📟 Screen 3 — Input State (Empty / Idle)

```
┌──────────────────────────────────────────────────────────┐
│  🤖 Autonomous CI/CD Healing Agent            [ NEW RUN ] │
│ ──────────────────────────────────────────────────────── │
│                                                           │
│  AGENT CONFIGURATION                                      │
│  ┌───────────────────────────────────────────────────┐   │
│  │  📦  https://github.com/owner/repo                │   │
│  └───────────────────────────────────────────────────┘   │
│  ┌──────────────────────┐  ┌───────────────────────┐     │
│  │  👥  Team Name        │  │  👤  Leader Name       │     │
│  └──────────────────────┘  └───────────────────────┘     │
│                                                           │
│  → Branch preview will appear as you type...             │
│                                                           │
│  [ ▶ Analyze Repository ]  ← disabled until all filled  │
│                                                           │
│  ─────────────────────────────────────────────────────   │
│  Results panels will appear below after the run starts   │
└──────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════╗
║               🖥️  React Dashboard  (Vite + React 18)                 ║
║                                                                       ║
║  ┌────────────┐ ┌─────────────┐ ┌──────────┐ ┌──────────────────┐  ║
║  │ 🔧 Input   │ │ 📋 Run      │ │ 🏆 Score │ │ ⏱️ CI/CD         │  ║
║  │  Section   │ │  Summary    │ │  Panel   │ │  Timeline        │  ║
║  └────────────┘ └─────────────┘ └──────────┘ └──────────────────┘  ║
║  ┌─────────────────────────┐  ┌────────────────────────────────────┐ ║
║  │      🛠️ Fixes Table      │  │     📡 Live Progress Log (SSE)     │ ║
║  └─────────────────────────┘  └────────────────────────────────────┘ ║
║            Context API (useReducer) — Global State                    ║
╚═══════════════════════════════╦══════════════════════════════════════╝
                                │  REST API + Server-Sent Events
                                ▼
╔══════════════════════════════════════════════════════════════════════╗
║               ⚡ FastAPI Backend  (Python 3.11)                       ║
║                                                                       ║
║  ┌──────────────────────────────────────────────────────────────┐   ║
║  │                  🧠 LangGraph Orchestrator                    │   ║
║  │                                                               │   ║
║  │  clone_repo → analyze_repo → create_branch → run_tests       │   ║
║  │                                                   │           │   ║
║  │                      ┌────────────────────────────┘           │   ║
║  │                      ▼  failures found?                        │   ║
║  │                   fix_code → commit_fixes → monitor_cicd      │   ║
║  │                                                   │           │   ║
║  │                      ┌────────────────────────────┘           │   ║
║  │                      ▼  still failing & retry < 5?            │   ║
║  │                   run_tests  (loops back)                      │   ║
║  │                      │  all passed or max retries hit          │   ║
║  │                      ▼                                         │   ║
║  │                   finalize → save results.json                │   ║
║  └──────────────────────────────────────────────────────────────┘   ║
║                                                                       ║
║  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   ║
║  │🔍 RepoAnaly │ │🧪 TestRunner│ │🤖 CodeFixer │ │🌿 GitAgent  │   ║
║  │    Agent    │ │   Agent     │ │ (Gemini AI) │ │             │   ║
║  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   ║
║  ┌─────────────┐ ┌─────────────┐                                     ║
║  │📡 CICD Mon. │ │🐳 Sandbox   │                                     ║
║  │   Agent     │ │  Executor   │                                     ║
║  └─────────────┘ └─────────────┘                                     ║
╚══════════════════════════════════════════════════════════════════════╝
         │                    │                  │
   ┌─────┴──────┐    ┌────────┴──────┐    ┌─────┴──────┐
   │ 🐙 GitHub  │    │ 🤖 Gemini AI  │    │ 🐳 Docker  │
   │   Repos   │    │  (FREE tier)  │    │  Sandbox   │
   └───────────┘    └───────────────┘    └────────────┘
```

---

## 🔄 Agent Workflow

The system is powered by a **LangGraph StateGraph** — a directed graph where 6 specialized agents share a single mutable state object and execute in sequence.

### 📍 Step-by-Step Walkthrough

```
STEP 1 ── 📥 USER INPUT
│
│  User provides:
│    • GitHub Repository URL
│    • Team Name  (e.g. "RIFT ORGANISERS")
│    • Leader Name (e.g. "Saiyam Kumar")
│
│  Agent auto-generates branch name:
│    RIFT_ORGANISERS_SAIYAM_KUMAR_AI_Fix
│
▼
STEP 2 ── 🔁 CLONE  (GitAgent)
│
│  • Injects GitHub token into clone URL
│  • Shallow clones with --depth 1 for speed
│  • Configures git identity: AI-AGENT
│  • Clones to isolated /tmp/repos/<name>_<timestamp>/
│
▼
STEP 3 ── 🔍 ANALYZE  (RepoAnalyzerAgent)
│
│  • Walks entire directory tree recursively
│  • Skips: node_modules, .git, __pycache__, venv, dist
│  • Finds all source files: .py .js .ts .jsx .tsx
│  • Identifies test files by pattern:
│      test_*.py  |  *_test.py  |  *.test.js  |  *.spec.ts
│
▼
STEP 4 ── 🌿 BRANCH  (GitAgent)
│
│  • Validates format: ^[A-Z0-9_]+_AI_Fix$
│  • Checks out latest main/master/develop
│  • Creates new branch — never touches main ✅
│
▼
STEP 5 ── 🧪 RUN TESTS  (TestRunnerAgent)
│
│  Python repos:
│    pip install -r requirements.txt
│    python -m pytest --tb=short -v
│    python -m flake8 (linting)
│
│  JavaScript repos:
│    npm install --silent
│    npx jest --json --no-coverage
│    npx eslint --format=json
│
│  Parses output → extracts per failure:
│    { file, line, bug_type, description }
│
│  Bug type detection via regex patterns:
│    SYNTAX      → SyntaxError, IndentationError
│    LINTING     → F401, unused import, no-unused-vars
│    TYPE_ERROR  → TypeError, TS####, AttributeError
│    LOGIC       → AssertionError, expected.*received
│    IMPORT      → ModuleNotFoundError, Cannot find module
│    INDENTATION → unexpected indent, unindent mismatch
│
▼
STEP 6 ── 🤖 FIX CODE  (CodeFixerAgent  ←  Gemini 2.0 Flash)
│
│  Groups failures by file (efficiency)
│
│  For each file with failures:
│    1. Read full file content
│    2. Format all failures as numbered list
│    3. Build targeted fix prompt → send to Gemini
│    4. Strip any markdown fences from response
│    5. Write fixed content back to disk
│    6. Record fix with formatted commit message
│
│  Commit message format (exact):
│    [AI-AGENT] Fix LINTING error in src/utils.py line 15
│              → remove the import statement
│
▼
STEP 7 ── 📝 COMMIT & PUSH  (GitAgent)
│
│  • git add -A
│  • Checks for actual changes (skips empty commits)
│  • git commit -m "[AI-AGENT] Fix N issues - iteration K"
│  • git push -u origin BRANCH_NAME --force
│  • Tracks commit count (penalty applied if > 20)
│
▼
STEP 8 ── 📡 MONITOR CI/CD  (CICDMonitorAgent)
│
│  With GitHub token:
│    Polls GitHub Actions API every 10 seconds
│    Waits up to 300 seconds for workflow to complete
│    Reads conclusion: success | failure | cancelled
│
│  Without token (fallback):
│    Re-runs tests locally to verify fixes worked
│
▼
STEP 9 ── 🔁 DECISION GATE  (Orchestrator)
│
│  ┌── All tests passed? ── YES ──► STEP 10 (Finalize ✅)
│  │
│  └── Still failing?
│        iteration < 5 ───────────► Back to STEP 5 (retry)
│        iteration = 5 ───────────► STEP 10 (Finalize ❌)
│
▼
STEP 10 ─ 🏁 FINALIZE
│
│  Calculates final score:
│    base_score     = 100
│    speed_bonus    = +10 if elapsed < 5 minutes
│    penalty        = -2 per commit over 20
│    final_score    = base + bonus - penalty
│
│  Saves results.json to /tmp/results/
│  Sets final_status: PASSED | FAILED
│
▼
STEP 11 ─ 📊 DASHBOARD RENDERS
│
│  SSE stream delivers:
│    { type: 'progress', message: '...' }
│    { type: 'status',   data: { ... } }
│    { type: 'done',     data: { final results } }
│
│  All panels update in real time:
│    Run Summary Card  ·  Score Panel
│    Fixes Table       ·  CI/CD Timeline
│    Progress Log      ·  Status Badge
│
```

---

## ⚙️ Tech Stack

### ⚡ Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.115.5 | REST API + SSE streaming endpoints |
| **uvicorn** | 0.32.1 | ASGI production server |
| **LangGraph** | 0.2.53 | Multi-agent StateGraph orchestration |
| **langchain-core** | 0.3.25 | LangGraph foundation layer |
| **Google Gemini AI** | 0.8.3 | AI-powered code fixing — FREE tier |
| **aiohttp** | 3.11.9 | Async HTTP for GitHub Actions polling |
| **pytest** | 8.3.4 | Python test execution |
| **flake8** | 7.1.1 | Python linting analysis |
| **pydantic** | 2.10.1 | Request/response data validation |
| **python-dotenv** | 1.0.1 | Environment variable loading |

---

## 📁 Directory Structure

```
cicd-healing-agent/                     ← Project root
│
├── 📂 frontend/                        ← React dashboard (Vite)
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Dashboard.jsx           ← Main layout grid
│   │   │   ├── Header.jsx              ← Top bar with live clock
│   │   │   ├── InputSection.jsx        ← Repo URL + team form
│   │   │   ├── RunSummaryCard.jsx      ← Status badge + stat boxes
│   │   │   ├── ScorePanel.jsx          ← Animated score circle
│   │   │   ├── FixesTable.jsx          ← Filterable fixes table
│   │   │   ├── CICDTimeline.jsx        ← Per-iteration timeline
│   │   │   └── ProgressLog.jsx         ← Live scrolling terminal
│   │   ├── 📂 context/
│   │   │   └── AgentContext.jsx        ← Global state management
│   │   ├── App.jsx                     ← Root component
│   │   ├── main.jsx                    ← ReactDOM entry point
│   │   └── index.css                  ← Design system + animations
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── nginx.conf                      ← Production web server
│   └── vercel.json                     ← Vercel deploy config
│
├── 📂 backend/                         ← Python FastAPI backend
│   ├── 📂 agents/
│   │   ├── orchestrator.py             ← LangGraph StateGraph
│   │   ├── repo_analyzer.py            ← File & test discovery
│   │   ├── test_runner.py              ← pytest + jest + linting
│   │   ├── code_fixer.py               ← Gemini AI code repair
│   │   ├── git_agent.py                ← Clone/branch/commit/push
│   │   └── cicd_monitor.py             ← GitHub Actions polling
│   ├── 📂 api/
│   │   └── main.py                     ← FastAPI + SSE endpoints
│   ├── 📂 tools/
│   │   └── sandbox.py                  ← Docker sandboxed execution
│   └── requirements.txt
│
├── 📂 docker/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── 📂 .github/workflows/
│   └── ci.yml                          ← GitHub Actions for this project
│
├── docker-compose.yml                  ← Full local stack
├── .env.example                        ← Environment variable template
├── .gitignore
├── railway.json                        ← Railway backend deploy
└── README.md
```
---