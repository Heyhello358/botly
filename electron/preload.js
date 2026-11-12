const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('botly', {
  get: (key) => ipcRenderer.invoke('store:get', key),
  set: (key, value) => ipcRenderer.invoke('store:set', key, value),

  getBots: () => ipcRenderer.invoke('bots:getAll'),
  addBot: (data) => ipcRenderer.invoke('bots:add', data),
  updateBot: (id, updates) => ipcRenderer.invoke('bots:update', id, updates),
  deleteBot: (id) => ipcRenderer.invoke('bots:delete', id),
  startBot: (id) => ipcRenderer.invoke('bots:start', id),
  stopBot: (id) => ipcRenderer.invoke('bots:stop', id),

  getCommands: () => ipcRenderer.invoke('commands:getAll'),
  saveCommands: (commands) => ipcRenderer.invoke('commands:save', commands),

  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),

  getActivity: () => ipcRenderer.invoke('activity:get'),
  getStats: () => ipcRenderer.invoke('stats:get'),

  // Console
  getGuilds: (botId) => ipcRenderer.invoke('console:getGuilds', botId),
  getChannels: (botId, guildId) => ipcRenderer.invoke('console:getChannels', botId, guildId),
  sendMessage: (payload) => ipcRenderer.invoke('console:sendMessage', payload),

  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  getVersion: () => ipcRenderer.invoke('app:getVersion'),

  onBotStatusChanged: (cb) => {
    const h = (_, d) => cb(d);
    ipcRenderer.on('bot:statusChanged', h);
    return () => ipcRenderer.removeListener('bot:statusChanged', h);
  },
  onUpdateAvailable: (cb) => {
    const h = (_, d) => cb(d);
    ipcRenderer.on('update:available', h);
    return () => ipcRenderer.removeListener('update:available', h);
  },
  onUpdateNotAvailable: (cb) => {
    const h = () => cb();
    ipcRenderer.on('update:not-available', h);
    return () => ipcRenderer.removeListener('update:not-available', h);
  },
  onUpdateProgress: (cb) => {
    const h = (_, d) => cb(d);
    ipcRenderer.on('update:progress', h);
    return () => ipcRenderer.removeListener('update:progress', h);
  },
  onUpdateDownloaded: (cb) => {
    const h = () => cb();
    ipcRenderer.on('update:downloaded', h);
    return () => ipcRenderer.removeListener('update:downloaded', h);
  },
  onUpdateError: (cb) => {
    const h = (_, m) => cb(m);
    ipcRenderer.on('update:error', h);
    return () => ipcRenderer.removeListener('update:error', h);
  }
});
