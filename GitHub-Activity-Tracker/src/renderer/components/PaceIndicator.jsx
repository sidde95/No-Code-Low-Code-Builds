import React from 'react'

const PACE_CONFIG = {
  good: {
    emoji: '🟢',
    label: 'Good',
    description: '7+ commits this week',
    color: 'text-github-green',
    bg: 'bg-green-900/30 border-green-700'
  },
  medium: {
    emoji: '🟡',
    label: 'Medium',
    description: '3–6 commits this week',
    color: 'text-github-yellow',
    bg: 'bg-yellow-900/30 border-yellow-700'
  },
  low: {
    emoji: '🔴',
    label: 'Low',
    description: '≤2 commits this week',
    color: 'text-github-red',
    bg: 'bg-red-900/30 border-red-700'
  }
}

/**
 * PaceIndicator — displays a colour-coded badge showing the user's weekly commit pace.
 */
export default function PaceIndicator({ pace, weeklyCount }) {
  const config = PACE_CONFIG[pace] || PACE_CONFIG.low

  return (
    <div className={`bg-github-card border rounded-lg p-4 flex flex-col items-center justify-center gap-2 ${config.bg}`}>
      <span className="text-4xl">{config.emoji}</span>
      <span className={`text-xl font-bold ${config.color}`}>{config.label} Pace</span>
      <span className="text-sm text-gray-400">{config.description}</span>
      <span className="text-2xl font-semibold text-white mt-1">{weeklyCount}</span>
      <span className="text-xs text-gray-500">commits past 7 days</span>
    </div>
  )
}
