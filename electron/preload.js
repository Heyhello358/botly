const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('botly', {
  // Store
  get: (key) => ipcRenderer.invoke('store:get', key),
  set: (key, value) => ipcRenderer.invoke('store:set', key, value),

  // Bots
  getBots: () => ipcRenderer.invoke('bots:getAll'),
  addBot: (data) => ipcRenderer.invoke('bots:add', data),
  updateBot: (id, updates) => ipcRenderer.invoke('bots:update', id, updates),
  deleteBot: (id) => ipcRenderer.invoke('bots:delete', id),
  startBot: (id) => ipcRenderer.invoke('bots:start', id),
  stopBot: (id) => ipcRenderer.invoke('bots:stop', id),

  // Commands
  getCommands: () => ipcRenderer.invoke('commands:getAll'),
  saveCommands: (commands) => ipcRenderer.invoke('commands:save', commands),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),

  // Activity & Stats
  getActivity: () => ipcRenderer.invoke('activity:get'),
  getStats: () => ipcRenderer.invoke('stats:get'),

  // Updates
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  // Events
  onBotStatusChanged: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('bot:statusChanged', handler);
    return () => ipcRenderer.removeListener('bot:statusChanged', handler);
  },
  onUpdateAvailable: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update:available', handler);
    return () => ipcRenderer.removeListener('update:available', handler);
  },
  onUpdateNotAvailable: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('update:not-available', handler);
    return () => ipcRenderer.removeListener('update:not-available', handler);
  },
  onUpdateProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update:progress', handler);
    return () => ipcRenderer.removeListener('update:progress', handler);
  },
  onUpdateDownloaded: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('update:downloaded', handler);
    return () => ipcRenderer.removeListener('update:downloaded', handler);
  },
  onUpdateError: (callback) => {
    const handler = (_event, msg) => callback(msg);
    ipcRenderer.on('update:error', handler);
    return () => ipcRenderer.removeListener('update:error', handler);
  }
});
