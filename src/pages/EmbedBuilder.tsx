import { useState } from 'react';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import type { EmbedData } from '@/types';

const defaultEmbed: EmbedData = {
  title: 'Welcome to Botly',
  description: 'This is a live preview of your Discord embed. Edit the fields on the left to see changes instantly.',
  color: '#5865F2',
  author: { name: 'Botly', icon_url: '' },
  footer: { text: 'Powered by Botly' },
  fields: [
    { name: 'Field 1', value: 'Value 1', inline: true },
    { name: 'Field 2', value: 'Value 2', inline: true },
  ],
  timestamp: true,
};

export default function EmbedBuilder() {
  const [embed, setEmbed] = useState<EmbedData>(defaultEmbed);
  const [copied, setCopied] = useState(false);

  function update(key: keyof EmbedData, value: any) {
    setEmbed(prev => ({ ...prev, [key]: value }));
  }

  function updateAuthor(key: string, value: string) {
    setEmbed(prev => ({
      ...prev,
      author: { ...(prev.author || { name: '' }), [key]: value }
    }));
  }

  function updateFooter(key: string, value: string) {
    setEmbed(prev => ({
      ...prev,
      footer: { ...(prev.footer || { text: '' }), [key]: value }
    }));
  }

  function addField() {
    const fields = [...(embed.fields || []), { name: 'New Field', value: 'Value', inline: false }];
    update('fields', fields);
  }

  function updateField(index: number, key: string, value: any) {
    const fields = [...(embed.fields || [])];
    fields[index] = { ...fields[index], [key]: value };
    update('fields', fields);
  }

  function removeField(index: number) {
    update('fields', (embed.fields || []).filter((_, i) => i !== index));
  }

  function copyJSON() {
    const payload = {
      embeds: [{
        title: embed.title || undefined,
        description: embed.description || undefined,
        color: embed.color ? parseInt(embed.color.replace('#', ''), 16) : undefined,
        author: embed.author?.name ? embed.author : undefined,
        footer: embed.footer?.text ? embed.footer : undefined,
        thumbnail: embed.thumbnail?.url ? embed.thumbnail : undefined,
        image: embed.image?.url ? embed.image : undefined,
        fields: embed.fields?.length ? embed.fields : undefined,
        timestamp: embed.timestamp ? new Date().toISOString() : undefined,
      }]
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Embed Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Visually build Discord embeds with live preview</p>
        </div>
        <button onClick={copyJSON} className="btn-primary">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="glass rounded-xl p-5 space-y-4">
            <div>
              <label className="label">Title</label>
              <input className="input mt-1.5" value={embed.title || ''} onChange={e => update('title', e.target.value)} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input mt-1.5 min-h-[100px] resize-y" value={embed.description || ''} onChange={e => update('description', e.target.value)} />
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2 mt-1.5">
                <input type="color" className="h-10 w-14 rounded-lg border border-input bg-transparent cursor-pointer" value={embed.color || '#5865F2'} onChange={e => update('color', e.target.value)} />
                <input className="input font-mono text-xs" value={embed.color || ''} onChange={e => update('color', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Author Name</label>
                <input className="input mt-1.5" value={embed.author?.name || ''} onChange={e => updateAuthor('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Author Icon URL</label>
                <input className="input mt-1.5 text-xs" value={embed.author?.icon_url || ''} onChange={e => updateAuthor('icon_url', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Footer Text</label>
                <input className="input mt-1.5" value={embed.footer?.text || ''} onChange={e => updateFooter('text', e.target.value)} />
              </div>
              <div>
                <label className="label">Thumbnail URL</label>
                <input className="input mt-1.5 text-xs" value={embed.thumbnail?.url || ''} onChange={e => update('thumbnail', { url: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Image URL</label>
              <input className="input mt-1.5 text-xs" value={embed.image?.url || ''} onChange={e => update('image', { url: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="timestamp" checked={!!embed.timestamp} onChange={e => update('timestamp', e.target.checked)} className="rounded" />
              <label htmlFor="timestamp" className="text-sm">Include timestamp</label>
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Fields</h3>
              <button onClick={addField} className="btn-ghost text-xs px-2 py-1">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {(embed.fields || []).map((field, i) => (
                <div key={i} className="rounded-lg bg-white/[0.03] p-3 space-y-2">
                  <div className="flex gap-2">
                    <input className="input text-xs" placeholder="Name" value={field.name} onChange={e => updateField(i, 'name', e.target.value)} />
                    <button onClick={() => removeField(i)} className="btn-ghost p-2 text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <input className="input text-xs" placeholder="Value" value={field.value} onChange={e => updateField(i, 'value', e.target.value)} />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={!!field.inline} onChange={e => updateField(i, 'inline', e.target.checked)} />
                    Inline
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky top-6">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Live Preview</p>
          <div className="rounded-lg bg-[#313338] p-4 shadow-xl">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">Botly</span>
                  <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[10px] font-medium text-white">BOT</span>
                  <span className="text-xs text-[#949ba4]">Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="mt-2 max-w-lg rounded overflow-hidden" style={{ borderLeft: `4px solid ${embed.color || '#5865F2'}` }}>
                  <div className="bg-[#2b2d31] p-3">
                    {embed.author?.name && (
                      <div className="flex items-center gap-2 mb-1.5">
                        {embed.author.icon_url && <img src={embed.author.icon_url} className="h-5 w-5 rounded-full" alt="" />}
                        <span className="text-xs font-medium text-white">{embed.author.name}</span>
                      </div>
                    )}
                    {embed.title && <div className="text-white font-semibold text-base mb-1">{embed.title}</div>}
                    {embed.description && <div className="text-[#dbdee1] text-sm whitespace-pre-wrap leading-relaxed">{embed.description}</div>}
                    
                    {embed.fields && embed.fields.length > 0 && (
                      <div className="mt-2 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                        {embed.fields.map((f, i) => (
                          <div key={i} className={f.inline ? '' : 'col-span-full'}>
                            <div className="text-white text-xs font-semibold">{f.name}</div>
                            <div className="text-[#dbdee1] text-sm">{f.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {embed.image?.url && (
                      <img src={embed.image.url} className="mt-2 max-w-full rounded max-h-60 object-cover" alt="" />
                    )}

                    {(embed.footer?.text || embed.timestamp) && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#949ba4]">
                        {embed.footer?.text}
                        {embed.footer?.text && embed.timestamp && ' • '}
                        {embed.timestamp && new Date().toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
