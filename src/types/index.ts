export interface Bot {
  id: string;
  name: string;
  token: string;
  clientId: string;
  status: 'online' | 'offline' | 'starting' | 'error';
  uptime: number;
  servers: number;
  users: number;
  createdAt: string;
  lastStarted: string | null;
  avatar: string | null;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  type: 'slash' | 'prefix';
  enabled: boolean;
  permissions: string[];
  botId?: string;
  cooldown?: number;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
}

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  autoStartBots: boolean;
}

export interface Stats {
  totalBots: number;
  onlineBots: number;
  offlineBots: number;
  totalServers: number;
  totalUsers: number;
}

export interface EmbedData {
  title?: string;
  description?: string;
  color?: string;
  author?: { name: string; icon_url?: string; url?: string };
  footer?: { text: string; icon_url?: string };
  thumbnail?: { url: string };
  image?: { url: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: boolean;
}

declare global {
  interface Window {
    botly: {
      get: (key: string) => Promise<any>;
      set: (key: string, value: any) => Promise<boolean>;
      getBots: () => Promise<Bot[]>;
      addBot: (data: { name: string; token: string; clientId?: string }) => Promise<Bot>;
      updateBot: (id: string, updates: Partial<Bot>) => Promise<Bot | null>;
      deleteBot: (id: string) => Promise<boolean>;
      startBot: (id: string) => Promise<{ success: boolean }>;
      stopBot: (id: string) => Promise<{ success: boolean }>;
      getCommands: () => Promise<Command[]>;
      saveCommands: (commands: Command[]) => Promise<boolean>;
      getSettings: () => Promise<Settings>;
      setSettings: (settings: Settings) => Promise<boolean>;
      getActivity: () => Promise<ActivityItem[]>;
      getStats: () => Promise<Stats>;
      getGuilds: (botId: string) => Promise<any[]>;
      getChannels: (botId: string, guildId: string) => Promise<any[]>;
      sendMessage: (payload: { botId: string; channelId: string; content?: string; embed?: EmbedData }) => Promise<any>;
      checkForUpdates: () => Promise<{ success: boolean; version?: string; error?: string }>;
      downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
      installUpdate: () => void;
      getVersion: () => Promise<string>;
      onBotStatusChanged: (callback: (data: { id: string; status: string; servers?: number; users?: number }) => void) => () => void;
      onUpdateAvailable: (callback: (data: { version: string }) => void) => () => void;
      onUpdateNotAvailable: (callback: () => void) => () => void;
      onUpdateProgress: (callback: (data: { percent: number }) => void) => () => void;
      onUpdateDownloaded: (callback: () => void) => () => void;
      onUpdateError: (callback: (msg: string) => void) => () => void;
    };
  }
}

export {};
