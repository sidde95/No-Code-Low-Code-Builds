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
   * Build a contribution heatmap for the past 365 days.
   * Returns an array of { date: 'YYYY-MM-DD', count: number } for every day
   * in the past year (index 0 = oldest, last = today).
   * @param {Array} events
   * @returns {Array<{ date: string, count: number }>}
   */
  computeContributionHeatmap(events) {
    // Count any contribution event per day
    const CONTRIBUTION_TYPES = new Set([
      'PushEvent', 'PullRequestEvent', 'IssuesEvent',
      'CreateEvent', 'PullRequestReviewEvent', 'CommitCommentEvent'
    ])
    const dayCounts = new Map()
    for (const event of events) {
      if (CONTRIBUTION_TYPES.has(event.type)) {
        const day = event.created_at.slice(0, 10)
        dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
      }
    }

    const result = []
    const todayMs = Date.now()
    for (let i = 364; i >= 0; i--) {
      const d = new Date(todayMs - i * 24 * 60 * 60 * 1000)
      const date = d.toISOString().slice(0, 10)
      result.push({ date, count: dayCounts.get(date) || 0 })
    }
    return result
  }

  /**
   * Compute activity type breakdown as counts and percentages.
   * @param {Array} events
   * @returns {{ commits: number, pullRequests: number, issues: number, reviews: number, total: number }}
   */
  computeActivityBreakdown(events) {
    let commits = 0, pullRequests = 0, issues = 0, reviews = 0
    for (const event of events) {
      switch (event.type) {
        case 'PushEvent': commits++; break
        case 'PullRequestEvent': pullRequests++; break
        case 'IssuesEvent': issues++; break
        case 'PullRequestReviewEvent': reviews++; break
        default: break
      }
    }
    const total = commits + pullRequests + issues + reviews || 1
    return {
      commits,
      pullRequests,
      issues,
      reviews,
      total,
      commitsPct: Math.round((commits / total) * 100),
      pullRequestsPct: Math.round((pullRequests / total) * 100),
      issuesPct: Math.round((issues / total) * 100),
      reviewsPct: Math.round((reviews / total) * 100)
    }
  }

  /**
   * Build a summarised activity timeline grouped by date (newest first).
   * Returns at most 10 date groups.
   * @param {Array} events
   * @returns {Array<{ date: string, items: Array<{ type: string, description: string }> }>}
   */
  computeActivityTimeline(events) {
    const grouped = new Map()

    for (const event of events) {
      const date = event.created_at.slice(0, 10)
      if (!grouped.has(date)) grouped.set(date, [])
      grouped.get(date).push(event)
    }

    const result = []
    for (const [date, dayEvents] of [...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0]))) {
      const items = []

      // Pushes — group by repo
      const pushByRepo = new Map()
      for (const e of dayEvents) {
        if (e.type === 'PushEvent') {
          const repo = e.repo?.name || 'unknown'
          pushByRepo.set(repo, (pushByRepo.get(repo) || 0) + (e.payload?.commits?.length || 1))
        }
      }
      if (pushByRepo.size > 0) {
        const totalCommits = [...pushByRepo.values()].reduce((a, b) => a + b, 0)
        const repoCount = pushByRepo.size
        const repoNames = [...pushByRepo.keys()].slice(0, 3)
        items.push({
          type: 'commits',
          description: `Created ${totalCommits} commit${totalCommits !== 1 ? 's' : ''} in ${repoCount} repositor${repoCount !== 1 ? 'ies' : 'y'}`,
          repos: repoNames
        })
      }

      // New repos created
      const created = dayEvents.filter((e) => e.type === 'CreateEvent' && e.payload?.ref_type === 'repository')
      if (created.length > 0) {
        items.push({
          type: 'repos',
          description: `Created ${created.length} repositor${created.length !== 1 ? 'ies' : 'y'}`,
          repos: created.map((e) => e.repo?.name).filter(Boolean).slice(0, 3)
        })
      }

      // PRs opened
      const prsOpened = dayEvents.filter((e) => e.type === 'PullRequestEvent' && e.payload?.action === 'opened')
      if (prsOpened.length > 0) {
        items.push({
          type: 'pullRequests',
          description: `Opened ${prsOpened.length} pull request${prsOpened.length !== 1 ? 's' : ''}`,
          repos: prsOpened.map((e) => e.repo?.name).filter(Boolean).slice(0, 3)
        })
      }

      // Issues opened
      const issuesOpened = dayEvents.filter((e) => e.type === 'IssuesEvent' && e.payload?.action === 'opened')
      if (issuesOpened.length > 0) {
        items.push({
          type: 'issues',
          description: `Opened ${issuesOpened.length} issue${issuesOpened.length !== 1 ? 's' : ''}`,
          repos: issuesOpened.map((e) => e.repo?.name).filter(Boolean).slice(0, 3)
        })
      }

      if (items.length > 0) result.push({ date, items })
      if (result.length >= 10) break
    }

    return result
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
