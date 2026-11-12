import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    notifications: true,
    autoStartBots: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        if (window.botly) {
          const s = await window.botly.getSettings();
          if (s) setSettings(s);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      if (window.botly) await window.botly.setSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Preferences and application settings</p>
      </div>

      <div className="glass rounded-xl p-6 space-y-6">
        <div>
          <h2 className="font-medium mb-4">Appearance</h2>
          <div>
            <label className="label">Theme</label>
            <select 
              className="input mt-1.5 max-w-xs"
              value={settings.theme}
              onChange={e => setSettings({ ...settings, theme: e.target.value as any })}
            >
              <option value="dark">Dark</option>
              <option value="light">Light (coming soon)</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6">
          <h2 className="font-medium mb-4">Notifications</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.notifications}
              onChange={e => setSettings({ ...settings, notifications: e.target.checked })}
              className="rounded border-input"
            />
            <div>
              <p className="text-sm font-medium">Enable notifications</p>
              <p className="text-xs text-muted-foreground">Get notified when bots go online/offline</p>
            </div>
          </label>
        </div>

        <div className="border-t border-white/5 pt-6">
          <h2 className="font-medium mb-4">Bot Behavior</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={settings.autoStartBots}
              onChange={e => setSettings({ ...settings, autoStartBots: e.target.checked })}
              className="rounded border-input"
            />
            <div>
              <p className="text-sm font-medium">Auto-start bots on launch</p>
              <p className="text-xs text-muted-foreground">Automatically start previously online bots when Botly opens</p>
            </div>
          </label>
        </div>

        <div className="border-t border-white/5 pt-6">
          <h2 className="font-medium mb-2">Data Storage</h2>
          <p className="text-sm text-muted-foreground">
            All data is stored locally on your machine in the AppData folder 
            (<code className="mx-1 px-1.5 py-0.5 rounded bg-white/5 text-xs font-mono">%APPDATA%\\botly</code>
            on Windows). Bot tokens are encrypted at rest.
          </p>
        </div>

        <div className="pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
