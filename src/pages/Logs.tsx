import { useEffect, useState } from 'react';
import { ScrollText, Trash2, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { ActivityItem } from '@/types';

export default function Logs() {
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      if (window.botly) {
        const data = await window.botly.getActivity();
        setLogs(data);
      }
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-semibold tracking-tight">Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Activity and event history</p>
        </div>
        <button onClick={load} className="btn-secondary text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="glass rounded-xl flex flex-col items-center justify-center py-20">
          <ScrollText className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No logs yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start some bots to see activity here</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-violet-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90">{log.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{formatRelativeTime(log.timestamp)}</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
