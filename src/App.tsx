import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Bots from './pages/Bots';
import Commands from './pages/Commands';
import EmbedBuilder from './pages/EmbedBuilder';
import Servers from './pages/Servers';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/Settings';
import Logs from './pages/Logs';
import Console from './pages/Console';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-60">
        <div className="min-h-screen p-6 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bots" element={<Bots />} />
            <Route path="/console" element={<Console />} />
            <Route path="/commands" element={<Commands />} />
            <Route path="/embeds" element={<EmbedBuilder />} />
            <Route path="/servers" element={<Servers />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
