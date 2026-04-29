import React, { useState, useMemo } from 'react'

/**
 * ContributionHeatmap — GitHub-style yearly contribution grid (52 weeks × 7 days).
 * Supports a year selector to filter data to a specific calendar year.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function getIntensityClass(count) {
  if (count === 0) return 'bg-github-border'
  if (count <= 2) return 'bg-green-900'
  if (count <= 4) return 'bg-green-700'
  if (count <= 6) return 'bg-green-500'
  return 'bg-github-green'
}

/**
 * Build a 52-week grid for the given year from heatmapData.
 * Returns { weeks: Array<Array<{date,count}>>, monthLabels: Array<{label,col}> }
 */
function buildYearGrid(heatmapData, year) {
  const dateMap = new Map(heatmapData.map((d) => [d.date, d.count]))

  // Determine start: Jan 1 of the year
  const jan1 = new Date(Date.UTC(year, 0, 1))
  // Adjust to the Monday on or before Jan 1 (ISO week starts Monday)
  const dayOfWeek = jan1.getUTCDay() // 0=Sun … 6=Sat
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const gridStart = new Date(jan1.getTime() + offsetToMonday * 86400000)

  const weeks = []
  const monthLabels = []
  let prevMonth = -1

  // Build 53 weeks max, keep only those within the year
  for (let w = 0; w < 53; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const cell = new Date(gridStart.getTime() + (w * 7 + d) * 86400000)
      const cellYear = cell.getUTCFullYear()
      const dateStr = cell.toISOString().slice(0, 10)
      // Only show cells within the requested year; grey out others
      if (cellYear !== year) {
        week.push({ date: dateStr, count: -1 }) // -1 = out of range
      } else {
        week.push({ date: dateStr, count: dateMap.get(dateStr) || 0 })
        const month = cell.getUTCMonth()
        if (month !== prevMonth) {
          monthLabels.push({ label: MONTHS[month], col: w })
          prevMonth = month
        }
      }
    }
    // Skip weeks entirely outside the year
    if (week.some((c) => c.count !== -1)) weeks.push(week)
    // Stop after Dec 31
    if (week[6].date >= `${year}-12-31`) break
  }

  return { weeks, monthLabels }
}

export default function ContributionHeatmap({ heatmapData }) {
  const today = new Date()
  const currentYear = today.getFullYear()

  // Derive available years from data
  const availableYears = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) return [currentYear]
    const years = new Set(heatmapData.map((d) => Number(d.date.slice(0, 4))))
    years.add(currentYear)
    return [...years].sort((a, b) => b - a)
  }, [heatmapData, currentYear])

  const [selectedYear, setSelectedYear] = useState(currentYear)

  const { weeks, monthLabels } = useMemo(
    () => buildYearGrid(heatmapData || [], selectedYear),
    [heatmapData, selectedYear]
  )

  // Count total contributions in selected year
  const totalContributions = useMemo(
    () =>
      (heatmapData || [])
        .filter((d) => d.date.startsWith(String(selectedYear)) && d.count > 0)
        .reduce((sum, d) => sum + d.count, 0),
    [heatmapData, selectedYear]
  )

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">
          {totalContributions.toLocaleString()} contributions in {selectedYear}
        </h3>
        {/* Year selector */}
        <div className="flex gap-1">
          {availableYears.slice(0, 5).map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                yr === selectedYear
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-400 hover:text-blue-300 border border-github-border hover:border-gray-400'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 650 }}>
          {/* Month labels */}
          <div className="flex mb-1 ml-7">
            {monthLabels.map(({ label, col }, i) => (
              <div
                key={i}
                className="text-xs text-gray-500"
                style={{ position: 'absolute', marginLeft: `${col * 13 + 28}px` }}
              >
                {label}
              </div>
            ))}
            {/* Spacer so month labels flow */}
            <div style={{ height: 16, width: weeks.length * 13 }} />
          </div>

          {/* Day labels + week columns */}
          <div className="flex gap-0">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-px mr-1">
              {DAYS.map((label, i) => (
                <div key={i} className="text-xs text-gray-500 h-3 leading-3 w-6 text-right pr-1">
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-px mr-px">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    title={cell.count >= 0 ? `${cell.date}: ${cell.count} contribution${cell.count !== 1 ? 's' : ''}` : ''}
                    className={`w-3 h-3 rounded-sm ${
                      cell.count < 0
                        ? 'bg-transparent'
                        : getIntensityClass(cell.count)
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end text-xs text-gray-500">
        <span>Less</span>
        {['bg-github-border', 'bg-green-900', 'bg-green-700', 'bg-green-500', 'bg-github-green'].map((cls) => (
          <div key={cls} className={`w-3 h-3 rounded-sm ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
