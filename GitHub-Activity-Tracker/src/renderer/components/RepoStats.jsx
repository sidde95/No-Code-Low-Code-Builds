import React from 'react'

/**
 * RepoStats — top 5 repos table showing stars, forks, language, last push.
 */
export default function RepoStats({ repos }) {
  if (!repos || repos.length === 0) {
    return (
      <div className="bg-github-card border border-github-border rounded-lg p-4 text-gray-500 text-sm">
        No repository data available.
      </div>
    )
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Top Repositories (by stars)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-github-border">
              <th className="text-left pb-2 font-medium">Repository</th>
              <th className="text-right pb-2 font-medium">⭐ Stars</th>
              <th className="text-right pb-2 font-medium">🍴 Forks</th>
              <th className="text-right pb-2 font-medium">Language</th>
              <th className="text-right pb-2 font-medium">Last Push</th>
            </tr>
          </thead>
          <tbody>
            {repos.map((repo) => (
              <tr key={repo.name} className="border-b border-github-border/50 hover:bg-white/5">
                <td className="py-2 pr-4">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {repo.name}
                  </a>
                </td>
                <td className="py-2 text-right text-yellow-400">{repo.stars.toLocaleString()}</td>
                <td className="py-2 text-right text-gray-400">{repo.forks.toLocaleString()}</td>
                <td className="py-2 text-right">
                  {repo.language ? (
                    <span className="bg-github-border px-2 py-0.5 rounded-full text-xs text-gray-300">
                      {repo.language}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="py-2 text-right text-gray-400 text-xs">{formatDate(repo.lastPush)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
