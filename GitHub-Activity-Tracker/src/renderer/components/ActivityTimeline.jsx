import React from 'react'

/**
 * ActivityTimeline — recent activity feed grouped by date,
 * mirroring GitHub's "Contribution activity" section.
 */

const TYPE_ICONS = {
  commits: '↑',
  repos: '📁',
  pullRequests: '⤵',
  issues: '●'
}

const TYPE_COLORS = {
  commits: 'text-github-green',
  repos: 'text-blue-400',
  pullRequests: 'text-purple-400',
  issues: 'text-orange-400'
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
}

export default function ActivityTimeline({ activityTimeline }) {
  if (!activityTimeline || activityTimeline.length === 0) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-4 text-gray-500 text-sm">
        No recent activity found.
      </div>
    )
  }

  // Group entries by month label
  const byMonth = []
  let currentMonth = null

  for (const entry of activityTimeline) {
    const monthLabel = formatDate(entry.date)
    if (monthLabel !== currentMonth) {
      byMonth.push({ month: monthLabel, entries: [] })
      currentMonth = monthLabel
    }
    byMonth[byMonth.length - 1].entries.push(entry)
  }

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Contribution Activity</h3>

      <div className="space-y-4">
        {byMonth.map(({ month, entries }) => (
          <div key={month}>
            {/* Month header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-300">{month}</span>
              <div className="flex-1 h-px bg-github-border" />
            </div>

            {/* Daily entries */}
            <div className="space-y-2 pl-1">
              {entries.map((entry, ei) => (
                <div key={ei} className="space-y-1">
                  {entry.items.map((item, ii) => (
                    <div key={ii} className="flex items-start gap-2">
                      {/* Icon */}
                      <span className={`text-sm leading-5 font-bold w-4 shrink-0 ${TYPE_COLORS[item.type] || 'text-gray-400'}`}>
                        {TYPE_ICONS[item.type] || '•'}
                      </span>

                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-300">{item.description}</span>
                        {item.repos && item.repos.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {item.repos.map((repo, ri) => (
                              <span key={ri} className="text-xs text-blue-400 truncate max-w-[180px]">
                                {repo}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Date badge */}
                      <span className="text-xs text-gray-500 shrink-0">{formatShortDate(entry.date)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
