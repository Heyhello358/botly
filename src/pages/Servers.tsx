import { useEffect, useState } from 'react';
import { Server, Users } from 'lucide-react';
import type { Bot } from '@/types';

export default function Servers() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (window.botly) {
          const data = await window.botly.getBots();
          setBots(data.filter(b => b.status === 'online'));
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

  const totalServers = bots.reduce((a, b) => a + b.servers, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Servers</h1>
        <p className="text-sm text-muted-foreground mt-1">Servers connected to your online bots</p>
      </div>

      {bots.length === 0 ? (
        <div className="glass rounded-xl flex flex-col items-center justify-center py-20">
          <Server className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No online bots</p>
          <p className="text-xs text-muted-foreground mt-1">Start a bot to see its servers here</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Total Servers</p>
              <p className="text-3xl font-semibold mt-1">{totalServers}</p>
            </div>
            <div className="glass rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Online Bots</p>
              <p className="text-3xl font-semibold mt-1">{bots.length}</p>
            </div>
            <div className="glass rounded-xl p-5">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-semibold mt-1">{bots.reduce((a, b) => a + b.users, 0)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {bots.map(bot => (
              <div key={bot.id} className="glass rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {bot.avatar ? (
                    <img src={bot.avatar} className="h-12 w-12 rounded-full" alt="" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-300 font-medium">
                      {bot.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{bot.name}</h3>
                    <p className="text-sm text-muted-foreground">{bot.servers} servers · {bot.users} users</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Server className="h-4 w-4" /> {bot.servers}</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {bot.users}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
