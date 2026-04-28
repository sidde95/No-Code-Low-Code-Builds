import React, { useState, useEffect } from 'react'

/**
 * Settings — allows the user to save/delete their GitHub PAT and toggle notifications.
 */
export default function Settings() {
  const [token, setToken] = useState('')
  const [savedToken, setSavedToken] = useState(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    window.electron.token.get().then((t) => setSavedToken(t)).catch(() => {})
    window.electron.notifications.getEnabled().then(setNotificationsEnabled).catch(() => {})
  }, [])

  const handleSaveToken = async () => {
    if (!token.trim()) return
    await window.electron.token.save(token.trim())
    setSavedToken(token.trim())
    setToken('')
    setStatus('✅ Token saved successfully.')
    setTimeout(() => setStatus(''), 3000)
  }

  const handleDeleteToken = async () => {
    await window.electron.token.delete()
    setSavedToken(null)
    setStatus('🗑️ Token deleted.')
    setTimeout(() => setStatus(''), 3000)
  }

  const handleToggleNotifications = async (val) => {
    await window.electron.notifications.setEnabled(val)
    setNotificationsEnabled(val)
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>

      {/* PAT Section */}
      <section className="bg-github-card border border-github-border rounded-lg p-5 mb-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-1">GitHub Personal Access Token</h3>
        <p className="text-xs text-gray-500 mb-3">
          A PAT allows fetching private data and avoids rate limits (60 → 5000 req/hr).{' '}
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Create one here ↗
          </a>{' '}
          (scope: <code className="bg-github-border px-1 rounded">public_repo</code>)
        </p>

        {savedToken ? (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs bg-green-900/40 border border-green-700 text-green-400 px-2 py-1 rounded">
              ✅ Token saved (••••{savedToken.slice(-4)})
            </span>
            <button
              onClick={handleDeleteToken}
              className="text-xs text-red-400 hover:text-red-300 border border-red-800 px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ) : (
          <p className="text-xs text-yellow-400 mb-3">⚠️ No token saved — unauthenticated (60 req/hr limit)</p>
        )}

        <div className="flex gap-2">
          <input
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveToken()}
            className="flex-1 bg-github-dark border border-github-border rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSaveToken}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
          >
            Save
          </button>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-github-card border border-github-border rounded-lg p-5 mb-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-1">Desktop Notifications</h3>
        <p className="text-xs text-gray-500 mb-3">
          Receive native notifications: report ready, pace drop alerts, and streak milestones.
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => handleToggleNotifications(!notificationsEnabled)}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-blue-600' : 'bg-github-border'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </div>
          <span className="text-sm text-gray-300">
            {notificationsEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </section>

      {/* Status message */}
      {status && (
        <p className="text-sm text-gray-400">{status}</p>
      )}
    </div>
  )
}
