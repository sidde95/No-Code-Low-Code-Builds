/**
 * ActivityReport — data model that aggregates a user's full activity analysis.
 * Provides a human-readable `summary` getter and a `toJSON()` serialiser.
 */
export class ActivityReport {
  /**
   * @param {Object} opts
   * @param {Object}  opts.profile       - Serialised UserProfile
   * @param {Array}   opts.weeklyGroups  - [{ week, commits }]
   * @param {number}  opts.weeklyCount   - Commits in the past 7 days
   * @param {string}  opts.pace          - 'low' | 'medium' | 'good'
   * @param {number}  opts.currentStreak
   * @param {number}  opts.longestStreak
   * @param {boolean[]} opts.last30Days  - Index 0 = today
   * @param {Array}   opts.repos         - Top repos array
   */
  constructor({ profile, weeklyGroups, weeklyCount, pace, currentStreak, longestStreak, last30Days, repos }) {
    this.profile = profile
    this.weeklyGroups = weeklyGroups
    this.weeklyCount = weeklyCount
    this.pace = pace
    this.currentStreak = currentStreak
    this.longestStreak = longestStreak
    this.last30Days = last30Days
    this.repos = repos
    this.generatedAt = new Date().toISOString()
  }

  /**
   * A one-line human-readable summary of the report.
   * @returns {string}
   */
  get summary() {
    const emoji = this.pace === 'good' ? '🟢' : this.pace === 'medium' ? '🟡' : '🔴'
    return `${this.profile.name} — ${emoji} ${this.pace.charAt(0).toUpperCase() + this.pace.slice(1)} pace — ${this.weeklyCount} commits this week — 🔥 ${this.currentStreak}-day streak`
  }

  /** @returns {Object} Plain object safe for IPC and JSON export */
  toJSON() {
    return {
      profile: this.profile,
      weeklyGroups: this.weeklyGroups,
      weeklyCount: this.weeklyCount,
      pace: this.pace,
      currentStreak: this.currentStreak,
      longestStreak: this.longestStreak,
      last30Days: this.last30Days,
      repos: this.repos,
      summary: this.summary,
      generatedAt: this.generatedAt
    }
  }
}
