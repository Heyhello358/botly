import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  Terminal, 
  MessageSquare, 
  Server, 
  BarChart3, 
  Settings,
  Hexagon,
  ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/bots', icon: Bot, label: 'Bots' },
  { to: '/commands', icon: Terminal, label: 'Commands' },
  { to: '/embeds', icon: MessageSquare, label: 'Embed Builder' },
  { to: '/servers', icon: Server, label: 'Servers' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.botly?.getVersion?.().then(v => setVersion(v)).catch(() => {});
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-white/5 bg-[#0c0c0e]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
          <Hexagon className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-white">Botly</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bot Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-white/8 text-white shadow-sm'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-4 w-4', isActive ? 'text-violet-400' : '')} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <div className="rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-3">
          <p className="text-xs font-medium text-violet-300">Desktop Edition</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {version ? `v${version}` : 'Data saved in AppData'}
          </p>
        </div>
      </div>
    </aside>
  );
}
