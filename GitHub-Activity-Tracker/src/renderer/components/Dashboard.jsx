import React, { useState, useEffect } from 'react'
import { useGitHubData } from '../hooks/useGitHubData.js'
import UserCard from '../components/UserCard.jsx'
import PaceIndicator from '../components/PaceIndicator.jsx'
import ActivityChart from '../components/ActivityChart.jsx'
import StreakChart from '../components/StreakChart.jsx'
import RepoStats from '../components/RepoStats.jsx'
import ContributionHeatmap from '../components/ContributionHeatmap.jsx'
import ActivityBreakdown from '../components/ActivityBreakdown.jsx'
import ActivityTimeline from '../components/ActivityTimeline.jsx'

/**
 * Dashboard — main search UI with history sidebar and results layout.
 */
export default function Dashboard() {
  const { report, loading, error, fetchUser } = useGitHubData()
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])

  // Load search history on mount
  useEffect(() => {
    window.electron.history.get().then(setHistory).catch(() => {})
  }, [])

  const handleSearch = async () => {
    if (!input.trim()) return
    await fetchUser(input)
    const updated = await window.electron.history.get()
    setHistory(updated)
  }

  const handleExport = async () => {
    if (!report) return
    const result = await window.electron.export.json(report)
    if (result.success) {
      alert(`Report saved to ${result.filePath}`)
    }
  }

  const handleClearHistory = async () => {
    await window.electron.history.clear()
    setHistory([])
  }

  return (
    <div className="flex h-full">
      {/* Sidebar — search history */}
      <aside className="w-48 shrink-0 bg-github-card border-r border-github-border flex flex-col p-3 gap-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">History</div>
        {history.length === 0 && (
          <p className="text-xs text-gray-500">No searches yet.</p>
        )}
        {history.map((user) => (
          <button
            key={user}
            onClick={() => { setInput(user); fetchUser(user) }}
            className="text-left text-sm text-blue-400 hover:text-blue-300 truncate"
          >
            {user}
          </button>
        ))}
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="mt-auto text-xs text-gray-500 hover:text-red-400"
          >
            Clear history
          </button>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Search bar */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter GitHub username…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-github-card border border-github-border rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium"
          >
            {loading ? 'Loading…' : 'Search'}
          </button>
          {report && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-github-card border border-github-border hover:border-gray-400 rounded text-sm"
            >
              Export JSON
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Results */}
        {report && (
          <div className="grid gap-4">
            {/* Row 1: User card + Pace */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <UserCard profile={report.profile} />
              </div>
              <PaceIndicator pace={report.pace} weeklyCount={report.weeklyCount} />
            </div>

            {/* Row 2: Contribution Heatmap (full width) */}
            <ContributionHeatmap heatmapData={report.heatmapData} />

            {/* Row 3: Activity chart + Streak */}
            <div className="grid grid-cols-2 gap-4">
              <ActivityChart weeklyGroups={report.weeklyGroups} />
              <StreakChart
                currentStreak={report.currentStreak}
                longestStreak={report.longestStreak}
                last30Days={report.last30Days}
              />
            </div>

            {/* Row 4: Activity breakdown + Timeline */}
            <div className="grid grid-cols-2 gap-4">
              <ActivityBreakdown activityBreakdown={report.activityBreakdown} />
              <ActivityTimeline activityTimeline={report.activityTimeline} />
            </div>

            {/* Row 5: Repo stats */}
            <RepoStats repos={report.repos} />
          </div>
        )}

        {!report && !loading && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <span className="text-4xl mb-3">🐙</span>
            <p className="text-sm">Enter a GitHub username to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
