/**
 * ActivityClassifier — Single Responsibility: transform raw GitHub event arrays
 * into commit counts, weekly groupings, pace labels, and streak data.
 */
export class ActivityClassifier {
  /** Pace thresholds */
  static PACE_LOW = 'low'
  static PACE_MEDIUM = 'medium'
  static PACE_GOOD = 'good'

  /**
   * Classify a weekly commit count into a pace label.
   * @param {number} weeklyCount
   * @returns {'low'|'medium'|'good'}
   */
  classify(weeklyCount) {
    if (weeklyCount <= 2) return ActivityClassifier.PACE_LOW
    if (weeklyCount <= 6) return ActivityClassifier.PACE_MEDIUM
    return ActivityClassifier.PACE_GOOD
  }

  /**
   * Count push events in the most recent 7-day window.
   * @param {Array} events - GitHub event objects
   * @returns {number}
   */
  countWeeklyCommits(events) {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return events.filter(
      (e) => e.type === 'PushEvent' && new Date(e.created_at) >= oneWeekAgo
    ).length
  }

  /**
   * Group push events by ISO week string (YYYY-WNN).
   * Returns an array of { week, commits } objects sorted ascending.
   * @param {Array} events
   * @returns {Array<{ week: string, commits: number }>}
   */
  groupByWeek(events) {
    const pushEvents = events.filter((e) => e.type === 'PushEvent')
    const weekMap = new Map()

    for (const event of pushEvents) {
      const week = this.#getISOWeekLabel(new Date(event.created_at))
      weekMap.set(week, (weekMap.get(week) || 0) + 1)
    }

    return Array.from(weekMap.entries())
      .map(([week, commits]) => ({ week, commits }))
      .sort((a, b) => a.week.localeCompare(b.week))
  }

  /**
   * Compute the current consecutive-day push streak, the longest ever streak,
   * and a boolean array for the last 30 days (true = had at least one push).
   * @param {Array} events
   * @returns {{ currentStreak: number, longestStreak: number, last30Days: boolean[] }}
   */
  computeStreak(events) {
    const pushDates = new Set(
      events
        .filter((e) => e.type === 'PushEvent')
        .map((e) => e.created_at.slice(0, 10)) // 'YYYY-MM-DD'
    )

    // Build last-30-days presence array (index 0 = today, 29 = 30 days ago)
    const last30Days = []
    const todayMs = Date.now()
    for (let i = 0; i < 30; i++) {
      const d = new Date(todayMs - i * 24 * 60 * 60 * 1000)
      last30Days.push(pushDates.has(d.toISOString().slice(0, 10)))
    }

    // Current streak — count backwards from today
    let currentStreak = 0
    for (let i = 0; i < 30; i++) {
      if (last30Days[i]) currentStreak++
      else break
    }

    // Longest streak — scan all push dates sorted descending
    const sortedDates = Array.from(pushDates).sort((a, b) => b.localeCompare(a))
    let longestStreak = 0
    let streak = 0
    let prevDate = null

    for (const dateStr of sortedDates) {
      if (!prevDate) {
        streak = 1
      } else {
        const diff =
          (new Date(prevDate) - new Date(dateStr)) / (24 * 60 * 60 * 1000)
        streak = diff === 1 ? streak + 1 : 1
      }
      if (streak > longestStreak) longestStreak = streak
      prevDate = dateStr
    }

    return { currentStreak, longestStreak, last30Days }
  }

  /**
   * @private
   * Returns a sortable ISO week label like "2024-W23".
   * @param {Date} date
   * @returns {string}
   */
  #getISOWeekLabel(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
  }
}
