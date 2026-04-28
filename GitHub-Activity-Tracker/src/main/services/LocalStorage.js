import Database from 'better-sqlite3'
import { join } from 'path'
import { app } from 'electron'

/**
 * LocalStorage — Single Responsibility: all SQLite persistence for the app.
 * Stores the GitHub PAT, search history, cached reports, and notification settings.
 * The database connection is kept private via a private class field.
 */
export class LocalStorage {
  /** @type {import('better-sqlite3').Database} */
  #db

  constructor() {
    const dbPath = join(app.getPath('userData'), 'activity-tracker.db')
    this.#db = new Database(dbPath)
    this.#migrate()
  }

  /** Create tables if they don't exist */
  #migrate() {
    this.#db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS search_history (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        username   TEXT NOT NULL,
        searched_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS cached_reports (
        username    TEXT PRIMARY KEY,
        report_json TEXT NOT NULL,
        cached_at   TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `)
  }

  // ── Token ────────────────────────────────────────────────────────────────────

  /** @param {string} token */
  saveToken(token) {
    this.#db
      .prepare(`INSERT INTO settings (key, value) VALUES ('token', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
      .run(token)
  }

  /** @returns {string|null} */
  getToken() {
    const row = this.#db.prepare(`SELECT value FROM settings WHERE key = 'token'`).get()
    return row ? row.value : null
  }

  deleteToken() {
    this.#db.prepare(`DELETE FROM settings WHERE key = 'token'`).run()
  }

  // ── Search history ────────────────────────────────────────────────────────────

  /** @param {string} username */
  addSearchHistory(username) {
    this.#db
      .prepare(`INSERT INTO search_history (username) VALUES (?)`)
      .run(username)
  }

  /** @returns {string[]} Most recent 20 unique usernames */
  getSearchHistory() {
    const rows = this.#db
      .prepare(
        `SELECT DISTINCT username FROM search_history ORDER BY id DESC LIMIT 20`
      )
      .all()
    return rows.map((r) => r.username)
  }

  clearSearchHistory() {
    this.#db.prepare(`DELETE FROM search_history`).run()
  }

  // ── Cached reports ────────────────────────────────────────────────────────────

  /**
   * @param {string} username
   * @param {Object} report
   */
  saveCachedReport(username, report) {
    this.#db
      .prepare(
        `INSERT INTO cached_reports (username, report_json) VALUES (?, ?)
         ON CONFLICT(username) DO UPDATE SET report_json = excluded.report_json, cached_at = datetime('now')`
      )
      .run(username, JSON.stringify(report))
  }

  /**
   * @param {string} username
   * @returns {Object|null}
   */
  getCachedReport(username) {
    const row = this.#db
      .prepare(`SELECT report_json FROM cached_reports WHERE username = ?`)
      .get(username)
    return row ? JSON.parse(row.report_json) : null
  }

  // ── Notifications setting ─────────────────────────────────────────────────────

  /** @returns {boolean} */
  getNotificationsEnabled() {
    const row = this.#db
      .prepare(`SELECT value FROM settings WHERE key = 'notifications_enabled'`)
      .get()
    return row ? row.value === 'true' : true // default on
  }

  /** @param {boolean} enabled */
  setNotificationsEnabled(enabled) {
    this.#db
      .prepare(
        `INSERT INTO settings (key, value) VALUES ('notifications_enabled', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`
      )
      .run(String(enabled))
  }
}
