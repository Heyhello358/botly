const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
const { Client, GatewayIntentBits, Partials, EmbedBuilder, ChannelType } = require('discord.js');

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

const activeClients = new Map();
let mainWindow;

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
    if (!isDev) {
      setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 3000);
    }
  });

  mainWindow.on('closed', () => {
    for (const [, client] of activeClients) client.destroy();
    activeClients.clear();
    mainWindow = null;
  });
}

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send('update:available', { version: info.version });
});
autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('update:not-available');
});
autoUpdater.on('download-progress', (p) => {
  mainWindow?.webContents.send('update:progress', { percent: p.percent });
});
autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update:downloaded');
});
autoUpdater.on('error', (err) => {
  mainWindow?.webContents.send('update:error', err.message);
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

// ========== Helpers ==========
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

// ========== IPC ==========
ipcMain.handle('store:get', (_, key) => store.get(key));
ipcMain.handle('store:set', (_, key, value) => { store.set(key, value); return true; });

ipcMain.handle('bots:getAll', () => store.get('bots') || []);

ipcMain.handle('bots:add', async (_, botData) => {
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

ipcMain.handle('bots:update', (_, id, updates) => {
  const bots = store.get('bots') || [];
  const index = bots.findIndex(b => b.id === id);
  if (index === -1) return null;
  bots[index] = { ...bots[index], ...updates };
  store.set('bots', bots);
  return bots[index];
});

ipcMain.handle('bots:delete', async (_, id) => {
  if (activeClients.has(id)) {
    activeClients.get(id).destroy();
    activeClients.delete(id);
  }
  store.set('bots', (store.get('bots') || []).filter(b => b.id !== id));
  addActivity('Bot deleted');
  return true;
});

ipcMain.handle('bots:start', async (_, id) => {
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
      const users = client.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);
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
      mainWindow?.webContents.send('bot:statusChanged', { id, status: 'online', servers: guilds, users });
    });

    client.on('error', (err) => {
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

ipcMain.handle('bots:stop', async (_, id) => {
  if (!activeClients.has(id)) throw new Error('Bot is not running');
  activeClients.get(id).destroy();
  activeClients.delete(id);
  const bots = store.get('bots') || [];
  const idx = bots.findIndex(b => b.id === id);
  if (idx !== -1) {
    bots[idx].status = 'offline';
    store.set('bots', bots);
  }
  addActivity('Bot stopped');
  mainWindow?.webContents.send('bot:statusChanged', { id, status: 'offline' });
  return { success: true };
});

// ===== Console / Guilds / Channels / Send =====
ipcMain.handle('console:getGuilds', async (_, botId) => {
  const client = activeClients.get(botId);
  if (!client) throw new Error('Bot is not online');

  return client.guilds.cache.map(g => ({
    id: g.id,
    name: g.name,
    icon: g.iconURL({ size: 64 }),
    memberCount: g.memberCount || 0
  })).sort((a, b) => a.name.localeCompare(b.name));
});

ipcMain.handle('console:getChannels', async (_, botId, guildId) => {
  const client = activeClients.get(botId);
  if (!client) throw new Error('Bot is not online');

  const guild = client.guilds.cache.get(guildId);
  if (!guild) throw new Error('Guild not found');

  return guild.channels.cache
    .filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
    .map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      position: c.position
    }))
    .sort((a, b) => a.position - b.position);
});

ipcMain.handle('console:sendMessage', async (_, { botId, channelId, content, embed }) => {
  const client = activeClients.get(botId);
  if (!client) throw new Error('Bot is not online');

  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) throw new Error('Invalid text channel');

  const payload = {};
  if (content) payload.content = content;

  if (embed) {
    const e = new EmbedBuilder();
    if (embed.title) e.setTitle(embed.title);
    if (embed.description) e.setDescription(embed.description);
    if (embed.color) e.setColor(embed.color);
    if (embed.author?.name) e.setAuthor({ name: embed.author.name, iconURL: embed.author.icon_url });
    if (embed.footer?.text) e.setFooter({ text: embed.footer.text });
    if (embed.thumbnail?.url) e.setThumbnail(embed.thumbnail.url);
    if (embed.image?.url) e.setImage(embed.image.url);
    if (embed.fields?.length) e.addFields(embed.fields);
    if (embed.timestamp) e.setTimestamp();
    payload.embeds = [e];
  }

  const msg = await channel.send(payload);
  addActivity(`Message sent in #${channel.name}`);
  return { id: msg.id, success: true };
});

ipcMain.handle('commands:getAll', () => store.get('commands') || []);
ipcMain.handle('commands:save', (_, commands) => { store.set('commands', commands); return true; });
ipcMain.handle('settings:get', () => store.get('settings'));
ipcMain.handle('settings:set', (_, settings) => { store.set('settings', settings); return true; });
ipcMain.handle('activity:get', () => store.get('activity') || []);
ipcMain.handle('stats:get', () => {
  const bots = store.get('bots') || [];
  return {
    totalBots: bots.length,
    onlineBots: bots.filter(b => b.status === 'online').length,
    offlineBots: bots.filter(b => b.status !== 'online').length,
    totalServers: bots.reduce((a, b) => a + (b.servers || 0), 0),
    totalUsers: bots.reduce((a, b) => a + (b.users || 0), 0)
  };
});

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
ipcMain.handle('update:install', () => autoUpdater.quitAndInstall(false, true));
ipcMain.handle('app:getVersion', () => app.getVersion());

console.log('Botly started. Data:', store.path);
