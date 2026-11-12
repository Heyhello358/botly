# Botly — Discord Bot Management Dashboard

A polished desktop application for managing Discord bots. Built with Electron + React + TypeScript + Tailwind CSS.

## Features

- **Dashboard** — Overview of bots, servers, users and recent activity
- **Bot Management** — Add bots with tokens, start/stop, view status & stats
- **Commands** — Create, enable/disable and delete slash/prefix commands
- **Embed Builder** — Visual Discord embed editor with live preview + JSON export
- **Servers** — View connected servers from online bots
- **Analytics** — Usage statistics and performance overview
- **Settings** — Theme, notifications, auto-start preferences
- **Local Storage** — All data (including encrypted tokens) saved in `%APPDATA%\\botly` on Windows

## Tech Stack

- Electron 32
- React 18 + TypeScript
- Vite
- Tailwind CSS
- discord.js (for live bot connections)
- electron-store (persistent local storage)

## Prerequisites

- Node.js 18+
- npm

## Setup & Development

```bash
# Install dependencies
npm install

# Run in development (Vite + Electron)
npm run electron:dev
```

## Build Windows .exe

```bash
# Build the production app and create installer
npm run electron:build
```

The installer will be generated in the `release/` folder.

On Windows the application data is stored at:

```
%APPDATA%\\botly\\
```

## Automatic Builds (GitHub Actions)

This repository includes a GitHub Actions workflow that builds the Windows `.exe` automatically.

To trigger a release build:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Or go to the **Actions** tab → **Build Botly** → **Run workflow**.

## Project Structure

```
botly/
├── electron/
│   ├── main.js       # Electron main process + IPC + discord.js clients
│   └── preload.js    # Context bridge
├── src/
│   ├── components/   # Shared UI
│   ├── pages/        # Route pages
│   ├── lib/          # Utilities
│   ├── types/        # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── .github/workflows/build.yml
├── index.html
├── vite.config.ts
└── package.json
```

## License

MIT
