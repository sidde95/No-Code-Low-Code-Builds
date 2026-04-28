import React from 'react'

/**
 * StreakChart — shows current streak, longest streak, and a 30-day dot strip.
 */
export default function StreakChart({ currentStreak, longestStreak, last30Days }) {
  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Push Streak</h3>

      {/* Streak numbers */}
      <div className="flex gap-6 mb-4">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-github-green">{currentStreak}</span>
          <span className="text-xs text-gray-400 mt-0.5">Current streak</span>
        </div>
        <div className="w-px bg-github-border" />
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-400">{longestStreak}</span>
          <span className="text-xs text-gray-400 mt-0.5">Longest streak</span>
        </div>
      </div>

      {/* 30-day dot strip — index 29 (oldest) → 0 (today) */}
      <div className="flex flex-wrap gap-1">
        {[...(last30Days || [])].reverse().map((active, i) => (
          <div
            key={i}
            title={`Day ${30 - i}`}
            className={`w-4 h-4 rounded-sm ${active ? 'bg-github-green' : 'bg-github-border'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">Last 30 days (left = oldest, right = today)</p>
    </div>
  )
}
