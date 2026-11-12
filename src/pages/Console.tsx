import { useEffect, useState } from 'react';
import { Server, Hash, Send, Loader2, Bot } from 'lucide-react';
import type { Bot as BotType, EmbedData } from '@/types';

export default function Console() {
  const [bots, setBots] = useState<BotType[]>([]);
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [guilds, setGuilds] = useState<any[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string>('');
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [content, setContent] = useState('');
  const [useEmbed, setUseEmbed] = useState(false);
  const [embed, setEmbed] = useState<EmbedData>({
    title: '',
    description: '',
    color: '#5865F2'
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const [loadingGuilds, setLoadingGuilds] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);

  useEffect(() => {
    loadBots();
  }, []);

  async function loadBots() {
    if (!window.botly) return;
    const data = await window.botly.getBots();
    const online = data.filter(b => b.status === 'online');
    setBots(online);
    if (online.length && !selectedBot) setSelectedBot(online[0].id);
  }

  useEffect(() => {
    if (!selectedBot) return;
    loadGuilds();
  }, [selectedBot]);

  async function loadGuilds() {
    setLoadingGuilds(true);
    setGuilds([]);
    setSelectedGuild('');
    setChannels([]
    setSelectedChannel('');
    try {
      const data = await window.botly.getGuilds(selectedBot);
      setGuilds(data);
      if (data.length) setSelectedGuild(data[0].id);
    } catch (e: any) {
      setStatus(e.message || 'Failed to load servers');
    } finally {
      setLoadingGuilds(false);
    }
  }

  useEffect(() => {
    if (!selectedBot || !selectedGuild) return;
    loadChannels();
  }, [selectedBot, selectedGuild]);

  async function loadChannels() {
    setLoadingChannels(true);
    setChannels([]);
    setSelectedChannel('');
    try {
      const data = await window.botly.getChannels(selectedBot, selectedGuild);
      setChannels(data);
      if (data.length) setSelectedChannel(data[0].id);
    } catch (e: any) {
      setStatus(e.message || 'Failed to load channels');
    } finally {
      setLoadingChannels(false);
    }
  }

  async function handleSend() {
    if (!selectedBot || !selectedChannel) return;
    if (!content.trim() && !useEmbed) return;

    setSending(true);
    setStatus('');
    try {
      await window.botly.sendMessage({
        botId: selectedBot,
        channelId: selectedChannel,
        content: content.trim() || undefined,
        embed: useEmbed ? embed : undefined
      });
      setStatus('Message sent!');
      setContent('');
      setTimeout(() => setStatus(''), 2500);
    } catch (e: any) {
      setStatus(e.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  if (bots.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Console</h1>
          <p className="text-sm text-muted-foreground mt-1">Send messages and embeds as your bots</p>
        </div>
        <div className="glass rounded-xl flex flex-col items-center justify-center py-20">
          <Bot className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No online bots</p>
          <p className="text-xs text-muted-foreground mt-1">Start a bot first to use the console</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-3rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Console</h1>
        <p className="text-sm text-muted-foreground mt-1">Send messages and embeds as your bots</p>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Sidebar - Bots & Servers & Channels */}
        <div className="col-span-4 glass rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <label className="label text-xs">Bot</label>
            <select
              className="input mt-1 text-sm"
              value={selectedBot}
              onChange={e => setSelectedBot(e.target.value)}
            >
              {bots.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <p className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Servers</p>
              {loadingGuilds ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : (
                guilds.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGuild(g.id)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-left transition-colors ${
                      selectedGuild === g.id ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {g.icon ? (
                      <img src={g.icon} className="h-7 w-7 rounded-full" alt="" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-medium text-violet-300">
                        {g.name[0]}
                      </div>
                    )}
                    <span className="truncate">{g.name}</span>
                  </button>
                ))
              )}
            </div>

            {selectedGuild && (
              <div className="p-2 border-t border-white/5">
                <p className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Channels</p>
                {loadingChannels ? (
                  <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                ) : (
                  channels.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChannel(c.id)}
                      className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-left transition-colors ${
                        selectedChannel === c.id ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Hash className="h-3.5 w-3.5 shrink-0 opacity-60" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main - Message composer */}
        <div className="col-span-8 glass rounded-xl flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {channels.find(c => c.id === selectedChannel)?.name || 'Select a channel'}
            </span>
          </div>

          <div className="flex-1 p-5 space-y-4 overflow-y-auto">
            <div>
              <label className="label">Message</label>
              <textarea
                className="input mt-1.5 min-h-[100px] resize-y"
                placeholder="Type a message to send as the bot..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useEmbed}
                onChange={e => setUseEmbed(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Include embed</span>
            </label>

            {useEmbed && (
              <div className="space-y-3 rounded-lg bg-white/[0.03] p-4">
                <div>
                  <label className="label text-xs">Embed Title</label>
                  <input className="input mt-1 text-sm" value={embed.title || ''} onChange={e => setEmbed({ ...embed, title: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs">Embed Description</label>
                  <textarea className="input mt-1 text-sm min-h-[80px]" value={embed.description || ''} onChange={e => setEmbed({ ...embed, description: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs">Color</label>
                  <div className="flex gap-2 mt-1">
                    <input type="color" className="h-9 w-12 rounded border border-input bg-transparent cursor-pointer" value={embed.color || '#5865F2'} onChange={e => setEmbed({ ...embed, color: e.target.value })} />
                    <input className="input text-xs font-mono" value={embed.color || ''} onChange={e => setEmbed({ ...embed, color: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {status && (
              <p className={`text-sm ${status.includes('sent') ? 'text-emerald-400' : 'text-red-400'}`}>{status}</p>
            )}
          </div>

          <div className="p-4 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSend}
              disabled={sending || !selectedChannel || (!content.trim() && !useEmbed)}
              className="btn-primary"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send as Bot sp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
