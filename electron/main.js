const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
const { Client, GatewayIntentBits, Partials } = require('discord.js');

// Data store - automatically uses %APPDATA%/botly on Windows
const store = new Store({
  name: 'botly-data',
  encryptionKey: 'botly-secure-key-change-in-production',
  defaults: {
    bots: [],
    commands: [],
    settings: {
      theme: 'dark',
      notifications: true,
      autoStartBots: false
    },
    activity: []
  }
});

// Active bot clients
const activeClients = new Map();

let mainWindow;

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0a0a0b',
    titleBarStyle: 'hiddenInset',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    show: false
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Check for updates shortly after launch
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch(() => {});
      }, 3000);
    }
  });

  mainWindow.on('closed', () => {
    for (const [id, client] of activeClients) {
      client.destroy();
    }
    activeClients.clear();
    mainWindow = null;
  });
}

// Auto-updater events
autoUpdater.on('update-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update:available', {
      version: info.version,
      releaseNotes: info.releaseNotes
    });
  }
});

autoUpdater.on('update-not-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update:not-available');
  }
});

autoUpdater.on('download-progress', (progress) => {
  if (mainWindow) {
    mainWindow.webContents.send('update:progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total
    });
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update:downloaded');
  }
});

autoUpdater.on('error', (err) => {
  if (mainWindow) {
    mainWindow.webContents.send('update:error', err.message);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ========== IPC Handlers ==========

ipcMain.handle('store:get', (event, key) => store.get(key));
ipcMain.handle('store:set', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('bots:getAll', () => store.get('bots') || []);

ipcMain.handle('bots:add', async (event, botData) => {
  const bots = store.get('bots') || [];
  const newBot = {
    id: require('crypto').randomUUID(),
    name: botData.name,
    token: botData.token,
    clientId: botData.clientId || '',
    status: 'offline',
    uptime: 0,
    servers: 0,
    users: 0,
    createdAt: new Date().toISOString(),
    lastStarted: null,
    avatar: null
  };
  bots.push(newBot);
  store.set('bots', bots);
  addActivity(`Bot "${newBot.name}" added`);
  return newBot;
});

ipcMain.handle('bots:update', (event, id, updates) => {
  const bots = store.get('bots') || [];
  const index = bots.findIndex(b => b.id === id);
  if (index === -1) return null;
  bots[index] = { ...bots[index], ...updates };
  store.set('bots', bots);
  return bots[index];
});

ipcMain.handle('bots:delete', async (event, id) => {
  if (activeClients.has(id)) {
    activeClients.get(id).destroy();
    activeClients.delete(id);
  }
  const bots = (store.get('bots') || []).filter(b => b.id !== id);
  store.set('bots', bots);
  addActivity(`Bot deleted`);
  return true;
});

ipcMain.handle('bots:start', async (event, id) => {
  const bots = store.get('bots') || [];
  const bot = bots.find(b => b.id === id);
  if (!bot) throw new Error('Bot not found');
  if (activeClients.has(id)) throw new Error('Bot already running');

  try {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ],
      partials: [Partials.Channel]
    });

    client.once('ready', () => {
      const guilds = client.guilds.cache.size;
      const users = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
      
      const updatedBots = store.get('bots') || [];
      const idx = updatedBots.findIndex(b => b.id === id);
      if (idx !== -1) {
        updatedBots[idx].status = 'online';
        updatedBots[idx].servers = guilds;
        updatedBots[idx].users = users;
        updatedBots[idx].lastStarted = new Date().toISOString();
        updatedBots[idx].avatar = client.user.displayAvatarURL();
        updatedBots[idx].name = client.user.username;
        store.set('bots', updatedBots);
      }
      
      addActivity(`Bot "${bot.name}" is now online (${guilds} servers)`);
      
      if (mainWindow) {
        mainWindow.webContents.send('bot:statusChanged', { id, status: 'online', servers: guilds, users });
      }
    });

    client.on('error', (err) => {
      console.error('Bot error:', err);
      addActivity(`Bot "${bot.name}" error: ${err.message}`);
    });

    await client.login(bot.token);
    activeClients.set(id, client);

    const updatedBots = store.get('bots') || [];
    const idx = updatedBots.findIndex(b => b.id === id);
    if (idx !== -1) {
      updatedBots[idx].status = 'starting';
      store.set('bots', updatedBots);
    }

    return { success: true };
  } catch (error) {
    addActivity(`Failed to start bot "${bot.name}": ${error.message}`);
    throw error;
  }
});

ipcMain.handle('bots:stop', async (event, id) => {
  if (!activeClients.has(id)) throw new Error('Bot is not running');
  
  const client = activeClients.get(id);
  client.destroy();
  activeClients.delete(id);

  const bots = store.get('bots') || [];
  const idx = bots.findIndex(b => b.id === id);
  if (idx !== -1) {
    bots[idx].status = 'offline';
    store.set('bots', bots);
  }
  
  addActivity(`Bot stopped`);
  if (mainWindow) {
    mainWindow.webContents.send('bot:statusChanged', { id, status: 'offline' });
  }
  return { success: true };
});

ipcMain.handle('commands:getAll', () => store.get('commands') || []);
ipcMain.handle('commands:save', (event, commands) => {
  store.set('commands', commands);
  return true;
});

ipcMain.handle('settings:get', () => store.get('settings'));
ipcMain.handle('settings:set', (event, settings) => {
  store.set('settings', settings);
  return true;
});

// Update handlers
ipcMain.handle('update:check', async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, version: result?.updateInfo?.version };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('update:download', async () => {
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('update:install', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('app:getVersion', () => app.getVersion());

function addActivity(message) {
  const activity = store.get('activity') || [];
  activity.unshift({
    id: require('crypto').randomUUID(),
    message,
    timestamp: new Date().toISOString()
  });
  if (activity.length > 100) activity.length = 100;
  store.set('activity', activity);
}

ipcMain.handle('activity:get', () => store.get('activity') || []);

ipcMain.handle('stats:get', () => {
  const bots = store.get('bots') || [];
  return {
    totalBots: bots.length,
    onlineBots: bots.filter(b => b.status === 'online').length,
    offlineBots: bots.filter(b => b.status === 'offline' || b.status === 'starting').length,
    totalServers: bots.reduce((acc, b) => acc + (b.servers || 0), 0),
    totalUsers: bots.reduce((acc, b) => acc + (b.users || 0), 0)
  };
});

console.log('Botly main process started. Data stored in:', store.path);
