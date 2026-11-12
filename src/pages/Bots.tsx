import { useEffect, useState } from 'react';
import { Plus, Bot, Power, Trash2, Loader2, Server, Users, X, ExternalLink, Copy, Check } from 'lucide-react';
import { cn, statusColor, formatRelativeTime } from '@/lib/utils';
import type { Bot as BotType } from '@/types';

export default function Bots() {
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', token: '', clientId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadBots();
    const unsub = window.botly?.onBotStatusChanged(() => loadBots());
    return () => unsub?.();
  }, []);

  async function loadBots() {
    try {
      if (!window.botly) {
        setBots([]);
        setLoading(false);
        return;
      }
      const data = await window.botly.getBots();
      setBots(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.token.trim()) {
      setError('Name and token are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await window.botly.addBot(form);
      setForm({ name: '', token: '', clientId: '' });
      setShowAdd(false);
      await loadBots();
    } catch (err: any) {
      setError(err.message || 'Failed to add bot');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStart(id: string) {
    setActionLoading(id);
    try {
      await window.botly.startBot(id);
      await loadBots();
    } catch (err: any) {
      alert(err.message || 'Failed to start bot. Check the token.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStop(id: string) {
    setActionLoading(id);
    try {
      await window.botly.stopBot(id);
      await loadBots();
    } catch (err: any) {
      alert(err.message || 'Failed to stop bot');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete bot "${name}"? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await window.botly.deleteBot(id);
      await loadBots();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  }

  function getInviteLink(bot: BotType) {
    const clientId = bot.clientId || 'YOUR_CLIENT_ID';
    return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
  }

  function copyInvite(bot: BotType) {
    const link = getInviteLink(bot);
    navigator.clipboard.writeText(link);
    setCopiedId(bot.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bots</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your Discord bots</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Bot
        </button>
      </div>

      {bots.length === 0 ? (
        <div className="glass rounded-xl flex flex-col items-center justify-center py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 mb-4">
            <Bot className="h-8 w-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-medium">No bots configured</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">Add a bot using its token to get started</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add your first bot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <div key={bot.id} className="glass rounded-xl p-5 card-hover flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {bot.avatar ? (
                      <img src={bot.avatar} className="h-12 w-12 rounded-full" alt="" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-lg font-semibold text-violet-300">
                        {bot.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={cn('absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0c0c0e]', statusColor(bot.status))} />
                  </div>
                  <div>
                    <h3 className="font-medium">{bot.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{bot.status}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Server className="h-3 w-3" /> Servers
                  </div>
                  <p className="font-medium mt-0.5">{bot.servers}</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Users className="h-3 w-3" /> Users
                  </div>
                  <p className="font-medium mt-0.5">{bot.users}</p>
                </div>
              </div>

              {bot.lastStarted && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Last started {formatRelativeTime(bot.lastStarted)}
                </p>
              )}

              <div className="mt-auto pt-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  {bot.status === 'online' || bot.status === 'starting' ? (
                    <button
                      onClick={() => handleStop(bot.id)}
                      disabled={actionLoading === bot.id}
                      className="btn-secondary flex-1 text-xs"
                    >
                      {actionLoading === bot.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
                      Stop
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStart(bot.id)}
                      disabled={actionLoading === bot.id}
                      className="btn-primary flex-1 text-xs"
                    >
                      {actionLoading === bot.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(bot.id, bot.name)}
                    disabled={actionLoading === bot.id}
                    className="btn-danger px-3"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => copyInvite(bot)}
                  className="btn-ghost text-xs w-full justify-center"
                  title="Copy invite link"
                >
                  {copiedId === bot.id ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
                  ) : (
                    <><ExternalLink className="h-3.5 w-3.5" /> Invite to Server</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Add Discord Bot</h2>
              <button onClick={() => setShowAdd(false)} className="btn-ghost p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="label">Bot Name</label>
                <input
                  className="input mt-1.5"
                  placeholder="My Awesome Bot"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Bot Token</label>
                <input
                  className="input mt-1.5 font-mono text-xs"
                  type="password"
                  placeholder="Paste your bot token"
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Token is stored encrypted locally in AppData. Never shared.
                </p>
              </div>
              <div>
                <label className="label">Client ID (for invite links)</label>
                <input
                  className="input mt-1.5 font-mono text-xs"
                  placeholder="Application / Client ID"
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Bot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
