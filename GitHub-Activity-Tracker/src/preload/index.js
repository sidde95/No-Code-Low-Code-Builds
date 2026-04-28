import { contextBridge, ipcRenderer } from 'electron'

/**
 * Preload script — exposes a safe, typed API surface to the renderer via contextBridge.
 * Node.js is never exposed; all communication goes through typed IPC channels.
 */
contextBridge.exposeInMainWorld('electron', {
  /** GitHub PAT management */
  token: {
    save: (token) => ipcRenderer.invoke('token:save', token),
    get: () => ipcRenderer.invoke('token:get'),
    delete: () => ipcRenderer.invoke('token:delete')
  },

  /** GitHub data fetching */
  github: {
    fetchUser: (username) => ipcRenderer.invoke('github:fetchUser', username)
  },

  /** Search history */
  history: {
    get: () => ipcRenderer.invoke('history:get'),
    clear: () => ipcRenderer.invoke('history:clear')
  },

  /** JSON export via save dialog */
  export: {
    json: (report) => ipcRenderer.invoke('export:json', report)
  },

  /** Notification settings */
  notifications: {
    getEnabled: () => ipcRenderer.invoke('notifications:getEnabled'),
    setEnabled: (enabled) => ipcRenderer.invoke('notifications:setEnabled', enabled)
  }
})
