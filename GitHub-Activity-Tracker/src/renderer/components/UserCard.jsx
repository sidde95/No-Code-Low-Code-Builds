import React from 'react'

/**
 * UserCard — displays avatar, name, bio, and key stats for a GitHub user.
 */
export default function UserCard({ profile }) {
  if (!profile) return null

  return (
    <div className="bg-github-card border border-github-border rounded-lg p-4 flex gap-4">
      <img
        src={profile.avatarUrl}
        alt={profile.login}
        className="w-16 h-16 rounded-full border-2 border-github-border"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="text-lg font-semibold text-white hover:text-blue-400 truncate"
          >
            {profile.name}
          </a>
          <span className="text-sm text-gray-400">@{profile.login}</span>
        </div>
        {profile.bio && (
          <p className="text-sm text-gray-400 mt-0.5 truncate">{profile.bio}</p>
        )}
        {profile.location && (
          <p className="text-xs text-gray-500 mt-0.5">📍 {profile.location}</p>
        )}
        <div className="flex gap-4 mt-2 text-sm">
          <span className="text-gray-300">
            📦 <strong>{profile.publicRepos}</strong> repos
          </span>
          <span className="text-gray-300">
            👥 <strong>{profile.followers}</strong> followers
          </span>
          <span className="text-gray-300">
            ➡️ <strong>{profile.following}</strong> following
          </span>
          <span className="text-gray-300">
            🕒 <strong>{profile.yearsOnGitHub}y</strong> on GitHub
          </span>
        </div>
      </div>
    </div>
  )
}
