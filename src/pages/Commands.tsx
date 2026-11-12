import { useEffect, useState } from 'react';
import { Plus, Terminal, Trash2, ToggleLeft, ToggleRight, X, Loader2 } from 'lucide-react';
import type { Command } from '@/types';
import { v4 as uuid } from 'uuid';

export default function Commands() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'slash' as const });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      if (!window.botly) {
        setCommands([]);
        setLoading(false);
        return;
      }
      const data = await window.botly.getCommands();
      setCommands(data);
    } finally {
      setLoading(false);
    }
  }

  async function save(cmds: Command[]) {
    setCommands(cmds);
    if (window.botly) await window.botly.saveCommands(cmds);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    const newCmd: Command = {
      id: uuid(),
      name: form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      type: form.type,
      enabled: true,
      permissions: [],
      createdAt: new Date().toISOString()
    };
    await save([newCmd, ...commands]);
    setForm({ name: '', description: '', type: 'slash' });
    setShowAdd(false);
    setSubmitting(false);
  }

  async function toggle(id: string) {
    const updated = commands.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c);
    await save(updated);
  }

  async function remove(id: string) {
    if (!confirm('Delete this command?')) return;
    await save(commands.filter(c => c.id !== id));
  }

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Commands</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage bot commands</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New Command
        </button>
      </div>

      {commands.length === 0 ? (
        <div className="glass rounded-xl flex flex-col items-center justify-center py-20">
          <Terminal className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No commands yet</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary mt-4 text-xs">Create command</button>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {commands.map((cmd) => (
                <tr key={cmd.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-mono text-violet-300">/{cmd.name}</td>
                  <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">{cmd.description || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs capitalize">{cmd.type}</span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggle(cmd.id)} className="flex items-center gap-1.5 text-xs">
                      {cmd.enabled ? (
                        <><ToggleRight className="h-4 w-4 text-emerald-400" /> Enabled</>
                      ) : (
                        <><ToggleLeft className="h-4 w-4 text-muted-foreground" /> Disabled</>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => remove(cmd.id)} className="btn-ghost p-1.5 text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">New Command</h2>
              <button onClick={() => setShowAdd(false)} className="btn-ghost p-1"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="label">Command Name</label>
                <input className="input mt-1.5" placeholder="ping" value={form.name} onChange={e => setForm({...form, name: e.target.value})} autoFocus />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input mt-1.5" placeholder="Check if the bot is alive" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input mt-1.5" value={form.type} onChange={e => setForm({...form, type: e.target.value as any})}>
                  <option value="slash">Slash Command</option>
                  <option value="prefix">Prefix Command</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
