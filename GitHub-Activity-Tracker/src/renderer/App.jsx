import React, { useState } from 'react'
import Home from './pages/Home.jsx'
import Settings from './pages/Settings.jsx'

const NAV_ITEMS = [
  { id: 'home', label: '📊 Dashboard' },
  { id: 'settings', label: '⚙️ Settings' }
]

/**
 * App — root component providing top-level navigation between Dashboard and Settings.
 */
export default function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top nav bar */}
      <nav className="flex items-center gap-1 bg-github-card border-b border-github-border px-4 py-2 select-none">
        <span className="text-white font-semibold text-sm mr-4">🐙 GitHub Activity Tracker</span>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              page === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-github-border'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Page content */}
      <main className="flex-1 overflow-auto">
        {page === 'home' ? <Home /> : <Settings />}
      </main>
    </div>
  )
}
