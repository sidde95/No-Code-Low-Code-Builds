# GitHub Activity Tracker

> A desktop app (Electron + React) that fetches any GitHub user's push history, classifies their weekly commit pace, visualises streaks, and shows top-repo statistics — all stored locally with SQLite.

![Screenshot placeholder](docs/screenshot.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron `^41.3.0` |
| Build tool | electron-vite `^2.3.0` |
| Frontend | React 18 + JSX |
| Styling | Tailwind CSS + PostCSS |
| Local storage | SQLite via `better-sqlite3` |
| HTTP client | axios |
| Charts | Recharts |
| Packaging (future) | electron-builder |

---

## Folder Layout

```
GitHub-Activity-Tracker/
├── package.json
├── electron.vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main/
    │   ├── index.js                 ← BrowserWindow (secure settings)
    │   ├── ipc-handlers.js          ← IPC channel registrations
    │   ├── services/
    │   │   ├── GitHubAPIService.js
    │   │   ├── ActivityClassifier.js
    │   │   ├── LocalStorage.js
    │   │   └── NotificationService.js
    │   └── models/
    │       ├── UserProfile.js
    │       └── ActivityReport.js
    ├── preload/
    │   └── index.js                 ← contextBridge → window.electron
    └── renderer/
        ├── index.html
        ├── main.jsx
        ├── App.jsx
        ├── styles/index.css
        ├── hooks/useGitHubData.js
        ├── components/
        │   ├── Dashboard.jsx
        │   ├── UserCard.jsx
        │   ├── PaceIndicator.jsx
        │   ├── ActivityChart.jsx
        │   ├── StreakChart.jsx
        │   └── RepoStats.jsx
        └── pages/
            ├── Home.jsx
            └── Settings.jsx
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (opens Electron window)
npm run dev

# 3. Build for production
npm run build
```

---

## How to Generate a GitHub PAT

1. Go to **https://github.com/settings/tokens**
2. Click **"Generate new token (classic)"**
3. Select scope: `public_repo` (read-only is enough)
4. Copy the token and paste it in the **Settings** page of the app

The token is stored locally in SQLite — it never leaves your machine.

---

## Features

1. **Username search** — Enter any GitHub username → fetch profile + recent push events
2. **Pace classifier** — Weekly commits → 🔴 Low (≤2) / 🟡 Medium (3–6) / 🟢 Good (7+)
3. **Weekly commit bar chart** — Recharts bar chart of commits per week
4. **SQLite caching** — PAT, search history, and last report stored locally
5. **JSON export** — Export the current report via Electron save dialog
6. **Settings page** — Save / delete GitHub PAT with link to token creation page
7. **Repo stats panel** — Top 5 repos sorted by stars (name, stars, forks, language, last push)
8. **Streak chart** — Current & longest consecutive-day push streaks with a 30-day dot strip
9. **Native notifications** — Electron Notification API: report ready, pace drop alert, 🔥 streak milestones (toggle in Settings)

---

## OOP Design

Every backend service and model is an ES module **class** with:
- **Private fields** (`#token`, `#db`) for encapsulation
- **JSDoc** describing each class's single responsibility
- `toJSON()` on all models for serialisation
