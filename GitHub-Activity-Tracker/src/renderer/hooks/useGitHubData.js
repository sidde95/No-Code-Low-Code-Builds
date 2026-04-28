import { useState, useCallback } from 'react'

/**
 * useGitHubData — custom hook that wraps all IPC calls to the main process.
 * Returns { report, loading, error, fetchUser }.
 */
export function useGitHubData() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async (username) => {
    if (!username.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await window.electron.github.fetchUser(username.trim())
      setReport(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch data. Check the username and your PAT.')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return { report, loading, error, fetchUser }
}
