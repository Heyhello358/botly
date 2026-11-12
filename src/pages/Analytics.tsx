import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Clock, Zap } from 'lucide-react';
import type { Stats, Bot } from '@/types';

export default function Analytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (window.botly) {
          const [s, b] = await Promise.all([window.botly.getStats(), window.botly.getBots()]);
          setStats(s);
          setBots(b);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Usage and performance insights</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bots', value: stats?.totalBots ?? 0, icon: Zap },
          { label: 'Online Rate', value: stats && stats.totalBots > 0 ? Math.round((stats.onlineBots / stats.totalBots) * 100) + '%' : '0%', icon: TrendingUp },
          { label: 'Total Servers', value: stats?.totalServers ?? 0, icon: BarChart3 },
          { label: 'Reach', value: stats?.totalUsers ?? 0, icon: Clock },
        ].map(card => (
          <div key={card.label} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-5">
        <h2 className="font-medium mb-4">Bot Performance</h2>
        {bots.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Add and start bots to see analytics</p>
        ) : (
          <div className="space-y-3">
            {bots.map(bot => (
              <div key={bot.id} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium truncate">{bot.name}</div>
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                    style={{ width: `${Math.min(100, (bot.servers / Math.max(1, stats?.totalServers || 1)) * 100)}%` }}
                  />
                </div>
                <div className="w-20 text-right text-sm text-muted-foreground">{bot.servers} servers</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
