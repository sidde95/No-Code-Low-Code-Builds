import axios from 'axios'

/**
 * GitHubAPIService — Single Responsibility: all HTTP communication with the GitHub REST API.
 * Encapsulates the Personal Access Token so it is never exposed outside this class.
 */
export class GitHubAPIService {
  /** @type {string} GitHub Personal Access Token (optional but recommended to avoid rate limits) */
  #token

  /**
   * @param {string|null} token - GitHub PAT or null for unauthenticated requests
   */
  constructor(token = null) {
    this.#token = token
    this.#client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
  }

  /** @private */
  #client

  /**
   * Fetch a user's public profile.
   * @param {string} username
   * @returns {Promise<Object>} GitHub user object
   */
  async fetchUserProfile(username) {
    const { data } = await this.#client.get(`/users/${username}`)
    return data
  }

  /**
   * Fetch the 100 most recent public events for a user.
   * @param {string} username
   * @returns {Promise<Array>} Array of GitHub event objects
   */
  async fetchUserEvents(username) {
    const { data } = await this.#client.get(`/users/${username}/events/public?per_page=100`)
    return data
  }

  /**
   * Fetch commit history for a specific repo.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Array>}
   */
  async fetchCommitHistory(owner, repo) {
    const { data } = await this.#client.get(`/repos/${owner}/${repo}/commits?per_page=100`)
    return data
  }

  /**
   * Fetch all repos for a user (up to 100), sorted by latest update.
   * @param {string} username
   * @returns {Promise<Array>}
   */
  async fetchTopRepos(username) {
    const { data } = await this.#client.get(
      `/users/${username}/repos?sort=updated&per_page=100`
    )
    // Sort by stargazers descending, return top 5
    return data
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        lastPush: r.pushed_at,
        url: r.html_url
      }))
  }

  /**
   * Fetch detailed stats for a single repo.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async fetchRepoStats(owner, repo) {
    const { data } = await this.#client.get(`/repos/${owner}/${repo}`)
    return data
  }
}
