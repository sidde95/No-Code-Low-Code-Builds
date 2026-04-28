/**
 * UserProfile — data model representing a GitHub user's public profile.
 * Provides a computed `yearsOnGitHub` getter and a `toJSON()` serialiser.
 */
export class UserProfile {
  /**
   * @param {Object} data - Raw GitHub API /users/{username} response
   */
  constructor(data) {
    this.login = data.login
    this.name = data.name || data.login
    this.avatarUrl = data.avatar_url
    this.bio = data.bio || ''
    this.publicRepos = data.public_repos
    this.followers = data.followers
    this.following = data.following
    this.createdAt = data.created_at
    this.htmlUrl = data.html_url
    this.location = data.location || ''
    this.blog = data.blog || ''
  }

  /**
   * Number of full years since the account was created.
   * @returns {number}
   */
  get yearsOnGitHub() {
    const created = new Date(this.createdAt)
    const now = new Date()
    return now.getFullYear() - created.getFullYear() -
      (now < new Date(now.getFullYear(), created.getMonth(), created.getDate()) ? 1 : 0)
  }

  /** @returns {Object} Plain object safe for IPC serialisation */
  toJSON() {
    return {
      login: this.login,
      name: this.name,
      avatarUrl: this.avatarUrl,
      bio: this.bio,
      publicRepos: this.publicRepos,
      followers: this.followers,
      following: this.following,
      createdAt: this.createdAt,
      htmlUrl: this.htmlUrl,
      location: this.location,
      blog: this.blog,
      yearsOnGitHub: this.yearsOnGitHub
    }
  }
}
