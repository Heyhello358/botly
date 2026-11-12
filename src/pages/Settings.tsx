import { useEffect, useState } from 'react';
import { Save, Loader2, RefreshCw, Download, CheckCircle2 } from 'lucide-react';
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

  // Update state
  const [version, setVersion] = useState('...');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'not-available' | 'error'>('idle');
  const [updateInfo, setUpdateInfo] = useState<{ version?: string; percent?: number; error?: string }>({});

  useEffect(() => {
    async function load() {
      try {
        if (window.botly) {
          const s = await window.botly.getSettings();
          if (s) setSettings(s);
          const v = await window.botly.getVersion();
          setVersion(v);
        }
      } finally {
        setLoading(false);
      }
    }
    load();

    // Listen for update events
    const unsubs = [
      window.botly?.onUpdateAvailable?.((info) => {
        setUpdateStatus('available');
        setUpdateInfo({ version: info.version });
      }),
      window.botly?.onUpdateNotAvailable?.(() => {
        setUpdateStatus('not-available');
      }),
      window.botly?.onUpdateProgress?.((progress) => {
        setUpdateStatus('downloading');
        setUpdateInfo(prev => ({ ...prev, percent: progress.percent }));
      }),
      window.botly?.onUpdateDownloaded?.(() => {
        setUpdateStatus('downloaded');
      }),
      window.botly?.onUpdateError?.((msg) => {
        setUpdateStatus('error');
        setUpdateInfo(prev => ({ ...prev, error: msg }));
      }),
    ];

    return () => unsubs.forEach(u => u?.());
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

  async function handleCheckUpdate() {
    setUpdateStatus('checking');
    setUpdateInfo({});
    try {
      const result = await window.botly.checkForUpdates();
      if (!result.success) {
        setUpdateStatus('error');
        setUpdateInfo({ error: result.error || 'Failed to check' });
      }
      // Status will be updated by the event listeners
    } catch (e: any) {
      setUpdateStatus('error');
      setUpdateInfo({ error: e.message });
    }
  }

  async function handleDownload() {
    setUpdateStatus('downloading');
    await window.botly.downloadUpdate();
  }

  function handleInstall() {
    window.botly.installUpdate();
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
        {/* Updates Section */}
        <div>
          <h2 className="font-medium mb-4">Updates</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current version</p>
              <p className="text-xs text-muted-foreground mt-0.5">v{version}</p>
            </div>
            <button
              onClick={handleCheckUpdate}
              disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
              className="btn-secondary text-xs"
            >
              {updateStatus === 'checking' ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking...</>
              ) : (
                <><RefreshCw className="h-3.5 w-3.5" /> Check for Updates</>
              )}
            </button>
          </div>

          {updateStatus === 'available' && (
            <div className="mt-4 rounded-lg bg-violet-500/10 border border-violet-500/20 p-4">
              <p className="text-sm font-medium text-violet-300">Update available: v{updateInfo.version}</p>
              <button onClick={handleDownload} className="btn-primary mt-3 text-xs">
                <Download className="h-3.5 w-3.5" /> Download Update
              </button>
            </div>
          )}

          {updateStatus === 'downloading' && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Downloading... {Math.round(updateInfo.percent || 0)}%</p>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${updateInfo.percent || 0}%` }}
                />
              </div>
            </div>
          )}

          {updateStatus === 'downloaded' && (
            <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
              <p className="text-sm font-medium text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Update ready to install
              </p>
              <button onClick={handleInstall} className="btn-primary mt-3 text-xs">
                Restart & Install
              </button>
            </div>
          )}

          {updateStatus === 'not-available' && (
            <p className="mt-3 text-sm text-muted-foreground">You're on the latest version.</p>
          )}

          {updateStatus === 'error' && (
            <p className="mt-3 text-sm text-red-400">{updateInfo.error || 'Something went wrong'}</p>
          )}
        </div>

        <div className="border-t border-white/5 pt-6">
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
