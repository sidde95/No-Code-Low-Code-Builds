import { Notification } from 'electron'

/**
 * NotificationService — Single Responsibility: send native desktop notifications
 * via Electron's Notification API, respecting the user's opt-in preference.
 */
export class NotificationService {
  /** @type {boolean} */
  #enabled

  /**
   * @param {import('./LocalStorage.js').LocalStorage} storage
   */
  constructor(storage) {
    this.#enabled = storage.getNotificationsEnabled()
  }

  /** @param {boolean} val */
  setEnabled(val) {
    this.#enabled = val
  }

  /**
   * Send a "Report ready" notification after a successful fetch.
   * @param {string} username
   * @param {'low'|'medium'|'good'} pace
   */
  notifyReportReady(username, pace) {
    if (!this.#enabled) return
    const paceLabel =
      pace === 'good' ? '🟢 Good' : pace === 'medium' ? '🟡 Medium' : '🔴 Low'
    this.#send('✅ Report Ready', `${username} — ${paceLabel} pace`)
  }

  /**
   * Warn when commit pace has dropped to Low from a higher level.
   * @param {string} previousPace
   * @param {string} currentPace
   */
  notifyIfPaceDropped(previousPace, currentPace) {
    if (!this.#enabled) return
    const wasHigher =
      (previousPace === 'good' || previousPace === 'medium') &&
      currentPace === 'low'
    if (wasHigher) {
      this.#send('⚠️ Pace Dropped', 'Your commit pace dropped to 🔴 Low this week')
    }
  }

  /**
   * Fire a streak milestone notification every multiple of 7 days.
   * @param {number} currentStreak
   */
  notifyStreakMilestone(currentStreak) {
    if (!this.#enabled) return
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      this.#send('🔥 Streak Milestone!', `You're on a ${currentStreak}-day push streak!`)
    }
  }

  /**
   * @private
   * @param {string} title
   * @param {string} body
   */
  #send(title, body) {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  }
}
