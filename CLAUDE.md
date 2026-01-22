# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

**Important:** Keep this file up-to-date whenever functionality changes.

## Overview

Claude Code Desktop is a desktop application built with Electron + React that provides a multi-session inbox with chat interface for interacting with Claude. It uses the Claude Agent SDK and supports MCP (Model Context Protocol) integrations.

## Project Architecture

This is a **Bun monorepo** with the following structure:

```
claude-code-desktop/
├── apps/                          # Applications
│   ├── electron/                  # Main desktop app (Electron + React)
│   └── viewer/                    # Web session viewer
│
├── packages/                      # Shared libraries
│   ├── core/                      # Core types and utilities
│   ├── shared/                    # Business logic
│   └── ui/                        # Shared UI components
│
├── scripts/                       # Build and install scripts
├── assets/                        # Global assets
└── package.json                   # Root workspace config
```

## Directory Details

### `apps/electron/` - Desktop Application

The main Electron desktop application.

```
apps/electron/
├── src/
│   ├── main/                      # Electron main process
│   │   ├── index.ts               # App entry, window creation, deep links
│   │   ├── ipc.ts                 # IPC handler registration
│   │   ├── menu.ts                # Application menu (File, Edit, View, Help)
│   │   ├── sessions.ts            # Session management, ClaudeCodeAgent integration
│   │   ├── onboarding.ts          # Onboarding IPC handlers
│   │   ├── deep-link.ts           # Deep link URL parsing (claudecode://)
│   │   ├── auto-update.ts         # Auto-update functionality
│   │   ├── window-manager.ts      # Window state management
│   │   └── logger.ts              # Electron logging
│   │
│   ├── preload/                   # Context bridge (main ↔ renderer)
│   │   └── index.ts               # Exposes electronAPI to renderer
│   │
│   ├── renderer/                  # React UI (Vite + shadcn)
│   │   ├── App.tsx                # Main app component
│   │   ├── main.tsx               # React entry point
│   │   ├── components/            # UI components
│   │   │   ├── chat/              # Chat UI (ChatInput, ChatDisplay)
│   │   │   ├── onboarding/        # Onboarding wizard components
│   │   │   ├── icons/             # App icons (AppLogo, AppSymbol)
│   │   │   ├── markdown/          # Markdown renderer with Shiki
│   │   │   └── ui/                # shadcn/ui components
│   │   ├── hooks/                 # React hooks
│   │   │   ├── useAgentState.ts   # Agent activation state machine
│   │   │   ├── useOnboarding.ts   # Onboarding state management
│   │   │   └── useTheme.ts        # Theme management
│   │   ├── contexts/              # React contexts
│   │   ├── atoms/                 # Jotai atoms for state management
│   │   ├── lib/                   # Utilities
│   │   ├── pages/                 # Page components
│   │   └── playground/            # Component development playground
│   │
│   └── shared/                    # Shared types between main/renderer
│       ├── types.ts               # IPC channels, interfaces
│       ├── routes.ts              # Type-safe route definitions
│       └── route-parser.ts        # Route string parsing
│
├── resources/                     # App resources
│   ├── icon.icns                  # macOS icon
│   ├── icon.ico                   # Windows icon
│   ├── icon.png                   # PNG icon
│   ├── themes/                    # Built-in themes
│   └── permissions/               # Default permission configs
│
├── electron-builder.yml           # electron-builder config
├── vite.config.ts                 # Vite config for renderer
└── package.json
```

### `packages/core/` - Core Types

Shared TypeScript types used across all packages.

```
packages/core/src/
├── types/
│   ├── workspace.ts               # Workspace, auth, config types
│   ├── session.ts                 # Session, metadata types
│   └── message.ts                 # Message, token, event types
└── utils/
    └── debug.ts                   # Debug logging utility
```

**Key types:**
- `Workspace` - Workspace configuration
- `Session` - Conversation scope
- `Message` - Chat message format
- `StoredConfig` - Application configuration
- `AgentEvent` - Events from ClaudeCodeAgent

### `packages/shared/` - Business Logic

Core business logic for the application.

```
packages/shared/src/
├── agent/                         # ClaudeCodeAgent, permissions, modes
│   ├── claude-code-agent.ts       # Main agent class wrapping Claude Agent SDK
│   ├── mode-manager.ts            # Permission mode management
│   ├── permissions-config.ts      # Customizable safety rules
│   └── session-scoped-tools.ts    # Tools available in sessions
│
├── auth/                          # Authentication
│   ├── claude-oauth.ts            # Claude OAuth flow
│   ├── google-oauth.ts            # Google OAuth
│   ├── microsoft-oauth.ts         # Microsoft OAuth
│   ├── slack-oauth.ts             # Slack OAuth
│   └── env.ts                     # Auth environment setup
│
├── config/                        # Configuration
│   ├── storage.ts                 # Config loading/saving
│   ├── preferences.ts             # User preferences
│   ├── theme.ts                   # Theme system
│   └── paths.ts                   # Config directory paths
│
├── credentials/                   # Secure credential storage
│   └── manager.ts                 # AES-256-GCM encrypted storage
│
├── sessions/                      # Session persistence
│   ├── storage.ts                 # Session CRUD
│   └── persistence-queue.ts       # Debounced async writes
│
├── mcp/                           # MCP client
│   └── client.ts                  # MCP server connections
│
├── sources/                       # External data sources
├── statuses/                      # Dynamic status system
├── prompts/                       # System prompt generation
├── utils/                         # Utilities (debug, summarize, etc.)
└── branding.ts                    # Application branding constants
```

### `packages/ui/` - Shared UI Components

Reusable React UI components.

```
packages/ui/src/
├── components/                    # UI components
│   ├── markdown/                  # Markdown rendering
│   ├── chat-message/              # Message display
│   └── ...
├── context/                       # React contexts
└── lib/                           # UI utilities
```

### `apps/viewer/` - Web Session Viewer

Simple web app for viewing exported sessions.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | [Bun](https://bun.sh/) |
| **Package Manager** | Bun workspaces |
| **AI SDK** | [@anthropic-ai/claude-agent-sdk](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk) |
| **Desktop** | [Electron](https://www.electronjs.org/) v39+ |
| **UI Framework** | React 18 |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Styling** | Tailwind CSS v4 |
| **State Management** | [Jotai](https://jotai.org/) |
| **Build (Main)** | esbuild |
| **Build (Renderer)** | Vite |
| **Credentials** | AES-256-GCM encrypted file storage |
| **TypeScript** | v5.0+ |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed
- Node.js 18+ (for Electron)
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd claude-code-desktop

# Install dependencies
bun install
```

### Development

```bash
# Start development server with hot reload
bun run electron:dev

# Windows
bun run electron:dev:win
```

This runs concurrently:
- Vite dev server for renderer (port 5173)
- esbuild watch for main process
- esbuild watch for preload script
- Electron app

### Build

```bash
# Build all components
bun run electron:build

# Windows
bun run electron:build:win

# Build and run
bun run electron:start
```

### Build Distribution

```bash
# macOS
bun run electron:dist:mac

# Windows
bun run electron:dist:win

# Linux
bun run electron:dist:linux
```

## NPM Scripts Reference

### Development

| Script | Description |
|--------|-------------|
| `electron:dev` | Hot reload development mode |
| `electron:dev:win` | Windows hot reload development |
| `electron:start` | Build and run |

### Build

| Script | Description |
|--------|-------------|
| `electron:build` | Build all components |
| `electron:build:main` | Build main process (esbuild) |
| `electron:build:preload` | Build preload script (esbuild) |
| `electron:build:renderer` | Build React app (Vite) |
| `electron:build:resources` | Copy resources |

### Distribution

| Script | Description |
|--------|-------------|
| `electron:dist` | Create distribution package |
| `electron:dist:mac` | macOS distribution (.dmg) |
| `electron:dist:win` | Windows distribution (.exe) |
| `electron:dist:linux` | Linux distribution |

### Type Checking & Linting

| Script | Description |
|--------|-------------|
| `typecheck` | Type check shared package |
| `typecheck:all` | Type check all packages |
| `lint:electron` | Lint Electron app |
| `test` | Run tests |

### Utilities

| Script | Description |
|--------|-------------|
| `electron:clean` | Clean build artifacts |
| `electron:clean:vite` | Clean Vite cache |
| `fresh-start` | Reset app state |

## Debugging

### Console Logging

In development, logs are written to:
- **macOS**: `~/Library/Logs/Claude Code Desktop/main.log`
- **Windows**: `%APPDATA%/Claude Code Desktop/logs/main.log`

Key log prefixes:
- `[SessionManager]` - Session lifecycle, auth setup
- `[IPC]` - Inter-process communication
- `[Onboarding]` - Onboarding flow

### DevTools

DevTools opens automatically in development. Main process logs appear in the terminal where you ran `electron:dev`.

### Renderer Debugging

1. Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows) for DevTools
2. Use React DevTools for component inspection
3. Check the Console tab for renderer logs

### Common Issues

**Vite cache errors:**
```bash
bun run electron:clean:vite
# Then restart: bun run electron:dev
```

**IPC handler not registered:**
- Ensure the main process has fully restarted
- Check that handler is registered in `ipc.ts`
- Restart the dev server completely (Ctrl+C, then `bun run electron:dev`)

**SDK path resolution errors:**
The Claude Agent SDK spawns a subprocess. After bundling, path resolution may break. The app explicitly sets the path in `main/index.ts`.

## Configuration

Configuration is stored at `~/.claude-code-desktop/`:

```
~/.claude-code-desktop/
├── config.json              # Main config (workspaces, auth type, apiBaseUrl)
├── credentials.enc          # Encrypted credentials (AES-256-GCM)
├── preferences.json         # User preferences
├── theme.json               # App-level theme
├── docs/                    # Bundled documentation
│   ├── sources.md           # Source integration docs
│   ├── agents.md            # Agent system docs
│   ├── permissions.md       # Permission system docs
│   └── source-guides/       # Per-service guides (gmail.com.md, etc.)
├── permissions/             # Default permission configs
│   └── default.json         # App-level default permissions
├── themes/                  # Custom themes directory
└── workspaces/
    └── {id}/
        ├── config.json      # Workspace settings
        ├── theme.json       # Workspace theme override
        ├── permissions.json # Workspace permission overrides
        ├── sessions/        # Session data (JSONL)
        ├── sources/         # Connected sources
        │   └── {slug}/
        │       └── permissions.json  # Per-source permissions
        ├── skills/          # Custom skills
        └── statuses/        # Status configuration
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_CONFIG_DIR` | Override config directory |
| `CLAUDE_CODE_VITE_PORT` | Override Vite dev server port (default: 5173) |
| `CLAUDE_CODE_APP_NAME` | Override app display name |
| `CLAUDE_CODE_DEEPLINK_SCHEME` | Override deep link scheme (default: claudecode) |
| `CLAUDE_CODE_DEBUG` | Enable debug logging (set to `1`) |
| `CLAUDE_CODE_LOCAL_MCP_ENABLED` | Enable/disable local MCP servers per workspace |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_BASE_URL` | Custom API base URL |

### OAuth Credentials (Optional)

For Google, Slack, Microsoft integrations, create `.env`:

```bash
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-secret
SLACK_OAUTH_CLIENT_ID=your-slack-client-id
SLACK_OAUTH_CLIENT_SECRET=your-slack-secret
MICROSOFT_OAUTH_CLIENT_ID=your-microsoft-client-id
```

## Key Concepts

### Permission Modes

Three-level permission system per session:

| Mode | Display | Behavior |
|------|---------|----------|
| `safe` | Explore | Read-only, blocks write operations |
| `ask` | Ask to Edit | Prompts for approval (default) |
| `allow-all` | Auto | Auto-approves all commands |

Cycle with **SHIFT+TAB** in chat.

### Deep Links

External apps can navigate using `claudecode://` URLs:

```
claudecode://settings
claudecode://allChats/chat/session123
claudecode://action/new-chat
```

### IPC Communication

Main ↔ Renderer communication uses typed channels defined in `shared/types.ts`:

```typescript
// Renderer → Main (invoke)
window.electronAPI.sendMessage(sessionId, content, attachments)

// Main → Renderer (events)
window.electronAPI.onAgentEvent(callback)
```

### State Management

- **Jotai** for global state (sessions, settings)
- **React Context** for navigation
- **IPC** for main process state

## Package Imports

```typescript
// Core types
import type { Workspace, Session, Message } from '@claude-code-desktop/core';

// Shared business logic
import { ClaudeCodeAgent } from '@claude-code-desktop/shared/agent';
import { loadStoredConfig, getApiBaseUrl } from '@claude-code-desktop/shared/config';
import { getCredentialManager } from '@claude-code-desktop/shared/credentials';

// UI components
import { Button, Input } from '@claude-code-desktop/ui';
```

## File Naming Conventions

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `kebab-case.ts`
- Types: `kebab-case.ts`

## Testing

```bash
# Run all tests
bun test

# Run specific package tests
cd packages/shared && bun test
```

## Contributing

1. Create a feature branch
2. Make changes with proper TypeScript types
3. Run `bun run typecheck:all` before committing
4. Update CLAUDE.md if architecture changes
