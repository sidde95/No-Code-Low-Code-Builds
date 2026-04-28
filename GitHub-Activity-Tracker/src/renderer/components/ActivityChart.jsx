import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

/**
 * ActivityChart — Recharts bar chart showing weekly commit history.
 */
export default function ActivityChart({ weeklyGroups }) {
  if (!weeklyGroups || weeklyGroups.length === 0) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-4 flex items-center justify-center text-gray-500 text-sm">
        No weekly data available.
      </div>
    )
  }

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Weekly Commits</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={weeklyGroups} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis
            dataKey="week"
            tick={{ fill: '#8b949e', fontSize: 11 }}
            tickFormatter={(w) => w.replace(/^\d{4}-/, '')}
          />
          <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6 }}
            labelStyle={{ color: '#c9d1d9' }}
            itemStyle={{ color: '#3fb950' }}
          />
          <Bar dataKey="commits" fill="#3fb950" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
