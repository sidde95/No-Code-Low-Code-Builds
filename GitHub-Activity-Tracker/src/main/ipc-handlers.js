import { ipcMain, dialog } from 'electron'
import { writeFileSync } from 'fs'
import { GitHubAPIService } from './services/GitHubAPIService.js'
import { ActivityClassifier } from './services/ActivityClassifier.js'
import { LocalStorage } from './services/LocalStorage.js'
import { NotificationService } from './services/NotificationService.js'
import { UserProfile } from './models/UserProfile.js'
import { ActivityReport } from './models/ActivityReport.js'

const storage = new LocalStorage()
const notifications = new NotificationService(storage)

/**
 * Registers all IPC handlers for the main process.
 * Each channel corresponds to a window.electron.* API in the preload.
 */
export function registerIpcHandlers() {
  // ── Token management ────────────────────────────────────────────────────────
  ipcMain.handle('token:save', (_event, token) => {
    storage.saveToken(token)
    return { success: true }
  })

  ipcMain.handle('token:get', () => {
    return storage.getToken()
  })

  ipcMain.handle('token:delete', () => {
    storage.deleteToken()
    return { success: true }
  })

  // ── GitHub data fetch ────────────────────────────────────────────────────────
  ipcMain.handle('github:fetchUser', async (_event, username) => {
    const token = storage.getToken()
    const api = new GitHubAPIService(token)
    const classifier = new ActivityClassifier()

    const profileData = await api.fetchUserProfile(username)
    const events = await api.fetchUserEvents(username)
    const repos = await api.fetchTopRepos(username)

    const profile = new UserProfile(profileData)
    const weeklyGroups = classifier.groupByWeek(events)
    const weeklyCount = classifier.countWeeklyCommits(events)
    const pace = classifier.classify(weeklyCount)
    const { currentStreak, longestStreak, last30Days } = classifier.computeStreak(events)
    const heatmapData = classifier.computeContributionHeatmap(events)
    const activityBreakdown = classifier.computeActivityBreakdown(events)
    const activityTimeline = classifier.computeActivityTimeline(events)

    // Build previous pace for notification comparison
    const cached = storage.getCachedReport(username)
    if (cached) {
      notifications.notifyIfPaceDropped(cached.pace, pace)
    }
    notifications.notifyReportReady(username, pace)
    notifications.notifyStreakMilestone(currentStreak)

    const report = new ActivityReport({
      profile: profile.toJSON(),
      weeklyGroups,
      weeklyCount,
      pace,
      currentStreak,
      longestStreak,
      last30Days,
      repos,
      heatmapData,
      activityBreakdown,
      activityTimeline
    })

    storage.saveCachedReport(username, report.toJSON())
    storage.addSearchHistory(username)

    return report.toJSON()
  })

  // ── Search history ───────────────────────────────────────────────────────────
  ipcMain.handle('history:get', () => {
    return storage.getSearchHistory()
  })

  ipcMain.handle('history:clear', () => {
    storage.clearSearchHistory()
    return { success: true }
  })

  // ── Export ───────────────────────────────────────────────────────────────────
  ipcMain.handle('export:json', async (_event, reportJson) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Activity Report',
      defaultPath: 'github-activity-report.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (canceled || !filePath) return { success: false }
    writeFileSync(filePath, JSON.stringify(reportJson, null, 2), 'utf-8')
    return { success: true, filePath }
  })

  // ── Notifications toggle ─────────────────────────────────────────────────────
  ipcMain.handle('notifications:getEnabled', () => {
    return storage.getNotificationsEnabled()
  })

  ipcMain.handle('notifications:setEnabled', (_event, enabled) => {
    storage.setNotificationsEnabled(enabled)
    notifications.setEnabled(enabled)
    return { success: true }
  })
}
