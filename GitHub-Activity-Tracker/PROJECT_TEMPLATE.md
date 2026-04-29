# 📋 Project Template — GitHub Activity Tracker

> **Technique used:** Tree of Thought (ToT) — multiple solution paths explored, evaluated, and merged into the best implementation.

---

## Phase 1 — Problem Statement

| Field | Detail |
|---|---|
| **Project Name** | GitHub Activity Tracker |
| **Type** | Desktop Application (No-Code / Low-Code build) |
| **Goal** | Track any GitHub user's push history, classify activity pace, and visualise streaks |
| **Target User** | Developers who want a local, private, offline-capable GitHub dashboard |
| **Constraint** | Must run 100% locally — no cloud dependency, no subscription fee |

---

## Phase 2 — Solution Architecture (ToT Exploration)

### 🌳 Branch A — Python + CustomTkinter
- **Pros:** Simpler stack, faster to prototype  
- **Cons:** Limited UI polish, not modern-looking, harder to distribute cross-platform  
- **Verdict:** ✗ Rejected

### 🌳 Branch B — Web App (React + Node.js server)
- **Pros:** Familiar React ecosystem  
- **Cons:** Requires a running server process, not truly local, firewall/port concerns  
- **Verdict:** ✗ Rejected

### 🌳 Branch C — Electron + React + SQLite ✅ SELECTED
- **Pros:** Native desktop window, full React ecosystem, SQLite for local storage, packages to .exe/.dmg  
- **Cons:** Slightly heavier than Python app  
- **Verdict:** ✅ Best balance of polish + local-first + OOP backend  

---

## Phase 3 — Feature Set

| # | Feature | Status | Component / File |
|---|---|---|---|
| 1 | Username search | ✅ Done | `Dashboard.jsx` |
| 2 | Pace classifier (🔴🟡🟢) | ✅ Done | `ActivityClassifier.js` + `PaceIndicator.jsx` |
| 3 | Weekly commit bar chart | ✅ Done | `ActivityChart.jsx` |
| 4 | SQLite caching (PAT + history) | ✅ Done | `LocalStorage.js` |
| 5 | JSON export | ✅ Done | `ipc-handlers.js` (export:json) |
| 6 | Settings page (PAT save/delete) | ✅ Done | `Settings.jsx` |
| 7 | Repo stats panel (top 5 by stars) | ✅ Done | `RepoStats.jsx` + `GitHubAPIService.fetchTopRepos()` |
| 8 | Streak chart (30-day dot strip) | ✅ Done | `StreakChart.jsx` + `ActivityClassifier.buildStreakData()` |
| 9 | Native notifications | ✅ Done | `NotificationService.js` + IPC handlers |

---

## Phase 4 — OOP Design Decisions

| Class | Responsibility | Key Private Fields |
|---|---|---|
| `GitHubAPIService` | All HTTP calls to GitHub REST API | `#token`, `#client` |
| `ActivityClassifier` | Classify pace, compute streaks, group by week | — (stateless) |
| `LocalStorage` | SQLite CRUD — token + search history | `#db` |
| `NotificationService` | Electron Notification API wrapper | — |
| `UserProfile` | Data model for a GitHub user | `login`, `createdAt`, … |
| `ActivityReport` | Full analysis result model with `summary` getter | `pace`, `weeklyCommits`, … |

**OOP Principles applied:**
- **Encapsulation** — private fields (`#field`) in every class
- **Single Responsibility** — each class does exactly one thing
- **Separation of Concerns** — backend services ↔ preload bridge ↔ React components never mix concerns

---

## Phase 5 — Setup & Run

```bash
# Prerequisites: Node.js 18+ installed
cd GitHub-Activity-Tracker

# 1. Install all dependencies
npm install

# 2. Run in development mode (opens Electron window)
npm run dev

# 3. Build for production
npm run build
```

---

## Phase 6 — Learning Outcomes

| What was built | Skill demonstrated |
|---|---|
| Electron main process | Node.js, IPC, security (contextIsolation) |
| React + Vite frontend | Component design, custom hooks, state management |
| OOP backend services | Encapsulation, SRP, private fields |
| SQLite local storage | Database basics without a server |
| GitHub REST API integration | REST, authentication, pagination |
| Recharts visualisations | Data visualisation |
| Native OS notifications | Platform API usage |

---

## Phase 7 — Future Improvements

- [ ] Heatmap calendar (like GitHub's contribution graph)
- [ ] AI summary via local Ollama model ("You had a great week!")
- [ ] Electron auto-updater
- [ ] Packaging to `.exe` / `.dmg` with electron-builder
- [ ] Dark / Light theme toggle

---

*Template filled using **Tree of Thought (ToT)** prompt technique — exploring multiple solution branches, evaluating each, and selecting the optimal path.*
