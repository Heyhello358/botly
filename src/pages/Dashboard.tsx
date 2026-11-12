import { useEffect, useState } from 'react';
import { Bot, Server, Users, Activity, Zap, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, formatNumber, formatRelativeTime, statusColor } from '@/lib/utils';
import type { Bot as BotType, Stats, ActivityItem } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bots, setBots] = useState<BotType[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const unsub = window.botly?.onBotStatusChanged(() => loadData());
    return () => unsub?.();
  }, []);

  async function loadData() {
    try {
      if (!window.botly) {
        setStats({ totalBots: 0, onlineBots: 0, offlineBots: 0, totalServers: 0, totalUsers: 0 });
        setBots([]);
        setActivity([]);
        setLoading(false);
        return;
      }
      const [s, b, a] = await Promise.all([
        window.botly.getStats(),
        window.botly.getBots(),
        window.botly.getActivity()
      ]);
      setStats(s);
      setBots(b);
      setActivity(a.slice(0, 8));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: 'Total Bots', value: stats?.totalBots ?? 0, icon: Bot, color: 'from-violet-500 to-purple-600' },
    { label: 'Online', value: stats?.onlineBots ?? 0, icon: Zap, color: 'from-emerald-500 to-teal-600' },
    { label: 'Servers', value: stats?.totalServers ?? 0, icon: Server, color: 'from-blue-500 to-cyan-600' },
    { label: 'Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'from-amber-500 to-orange-600' },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your bot fleet</p>
        </div>
        <Link to="/bots" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Bot
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="glass rounded-xl p-5 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-semibold mt-1 tracking-tight">{formatNumber(card.value)}</p>
              </div>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg', card.color)}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Bot Status</h2>
            <Link to="/bots" className="text-xs text-violet-400 hover:text-violet-300">View all</Link>
          </div>
          
          {bots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No bots yet</p>
              <Link to="/bots" className="btn-primary mt-4 text-xs">Add your first bot</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {bots.slice(0, 5).map((bot) => (
                <div key={bot.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {bot.avatar ? (
                        <img src={bot.avatar} alt="" className="h-9 w-9 rounded-full" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 text-sm font-medium">
                          {bot.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0c0c0e]', statusColor(bot.status))} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{bot.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{bot.status} · {bot.servers} servers</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium">Recent Activity</h2>
          </div>
          
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground/90 leading-snug">{item.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{formatRelativeTime(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
