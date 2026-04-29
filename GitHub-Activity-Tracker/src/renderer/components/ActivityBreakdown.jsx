import React from 'react'

/**
 * ActivityBreakdown — shows a percentage breakdown of activity types
 * (Commits, Pull Requests, Issues, Code Reviews) mirroring GitHub's
 * Activity Overview quadrant chart.
 */

const TYPE_CONFIG = [
  {
    key: 'commitsPct',
    count: 'commits',
    label: 'Commits',
    color: 'bg-github-green',
    textColor: 'text-github-green',
    barColor: '#3fb950'
  },
  {
    key: 'pullRequestsPct',
    count: 'pullRequests',
    label: 'Pull Requests',
    color: 'bg-blue-400',
    textColor: 'text-blue-400',
    barColor: '#60a5fa'
  },
  {
    key: 'issuesPct',
    count: 'issues',
    label: 'Issues',
    color: 'bg-orange-400',
    textColor: 'text-orange-400',
    barColor: '#fb923c'
  },
  {
    key: 'reviewsPct',
    count: 'reviews',
    label: 'Code Reviews',
    color: 'bg-purple-400',
    textColor: 'text-purple-400',
    barColor: '#c084fc'
  }
]

export default function ActivityBreakdown({ activityBreakdown }) {
  if (!activityBreakdown || activityBreakdown.total === undefined) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-4 flex items-center justify-center text-gray-500 text-sm">
        No activity data available.
      </div>
    )
  }

  const { total } = activityBreakdown

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Activity Overview</h3>

      {/* Stacked bar */}
      <div className="flex h-3 rounded overflow-hidden mb-4 gap-px">
        {TYPE_CONFIG.map(({ key, barColor }) => {
          const pct = activityBreakdown[key] || 0
          return pct > 0 ? (
            <div
              key={key}
              style={{ width: `${pct}%`, backgroundColor: barColor }}
              title={`${pct}%`}
            />
          ) : null
        })}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {TYPE_CONFIG.map(({ key, count, label, textColor }) => {
          const pct = activityBreakdown[key] || 0
          const raw = activityBreakdown[count] || 0
          return (
            <div key={key} className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-bold ${textColor}`}>{pct}%</span>
                <span className="text-xs text-gray-500">({raw})</span>
              </div>
              <span className="text-xs text-gray-400">{label}</span>
              {/* Mini bar */}
              <div className="mt-1 h-1.5 bg-github-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${TYPE_CONFIG.find((t) => t.key === key)?.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Based on {total} tracked event{total !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
