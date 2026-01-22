# Repository Guidelines

## Project Structure & Module Organization
This Bun monorepo is organized into apps and shared packages.

- `apps/electron/`: primary desktop app. `src/main/` runs Electron main, `src/preload/` exposes IPC APIs, `src/renderer/` is the React UI.
- `apps/viewer/`: read-only session viewer for shared links.
- `apps/marketing/`: marketing site.
- `packages/shared/`: cross-app business logic (agent runtime, sessions, sources, config).
- `packages/core/`: shared types and constants.
- `packages/ui/`: reusable UI components.
- `assets/`: static assets.
- Tests live in `__tests__/` folders near the code they cover.

## Architecture Overview (End-to-End)
The renderer drives UI state, uses `window.electronAPI` (preload bridge) to call IPC handlers in the main process, and receives streaming updates back over IPC. The main process owns filesystem access, workspace/session persistence, source/server orchestration, and window management. Core domain logic is shared from `packages/shared/` and reused by main and renderer where appropriate.

### Desktop Runtime & IPC
`apps/electron/src/main/index.ts` initializes the app, creates the `SessionManager` and `WindowManager`, then registers handlers in `apps/electron/src/main/ipc.ts`. The preload bridge in `apps/electron/src/preload/index.ts` exposes typed calls like `sendMessage`, `getSessions`, `createWorkspace`, and theme or notification operations. The renderer never touches Node APIs directly; it only communicates through IPC channels.

### Session Lifecycle (Core)
Sessions are created via IPC, stored with helpers in `packages/shared/src/sessions/`, and lazily loaded by `SessionManager` in `apps/electron/src/main/sessions.ts`. When a user sends a message, the manager instantiates `ClaudeCodeAgent` from `packages/shared/src/agent/`, streams output and tool events back to the UI, and persists messages through the session persistence queue. Attachments are stored under the per-session directory returned by `getSessionAttachmentsPath`.

### Session Event Stream
Agent events (text deltas, tool calls, status updates, token usage) are converted into `SessionEvent` payloads and emitted on the IPC `SESSION_EVENT` channel. The renderer subscribes with `electronAPI.onSessionEvent` and updates UI state incrementally (streaming text, tool badges, token counts). Message IDs are generated in shared types (`generateMessageId`) so the UI and persistence layer stay aligned.

### Permission Modes & Approvals
Permission modes are enforced in `packages/shared/src/agent/`: `safe` blocks writes, `ask` requires approval, and `allow-all` auto-approves. The UI prompts for decisions and replies over IPC (`respondToPermission`, `respondToCredential`) so the agent can proceed. Workspace defaults and cycling behavior are stored in config and updated by IPC settings handlers.

### MCP & Source Pipeline
`packages/shared/src/sources/` loads source configs, resolves credentials with `packages/shared/src/credentials/`, and builds MCP/API servers via the source server builder. The main process wires sources into the agent runtime; `packages/shared/src/mcp/` provides the MCP client integration used during tool execution. Auth errors mark sources as needing re-auth for the UI.

### Auth & Credentials
OAuth flows and tokens are handled in `packages/shared/src/auth/`, while encrypted secrets are managed by `packages/shared/src/credentials/` (AES-256-GCM). The main process triggers auth flows, persists credentials, and reinitializes the session manager when auth settings change.

### Workspaces, Config, and Storage
Global config and workspace config are managed in `packages/shared/src/config/` and stored in `~/.claude-code-desktop/`. Each workspace contains session data, sources, skills, statuses, and theme overrides. Session persistence helpers in `packages/shared/src/sessions/` read/write JSONL message histories and metadata.

### UI Composition & Theming
The React UI in `apps/electron/src/renderer/` uses shared components from `packages/ui/`. Theme settings are stored on disk and synced across windows via IPC theme handlers; presets are loaded from bundled resources in the Electron app.

### Viewer App
`apps/viewer/` provides a lightweight UI for shared sessions. It consumes the same shared UI components and types, but is read-only and designed for external sharing.

### Logging, Notifications, and Windowing
Logging lives in `apps/electron/src/main/logger.ts`, with optional log tailing in dev scripts. Notification and badge updates are handled in `apps/electron/src/main/notifications.ts` and triggered via IPC from the renderer. `WindowManager` coordinates multi-window behavior for workspaces and shared sessions.

## Build, Test, and Development Commands
- `bun install`: install workspace dependencies.
- `bun run electron:dev`: start Electron with hot reload and dev logging.
- `bun run electron:start`: build and launch the desktop app.
- `bun run electron:build`: build main, preload, renderer, and resources.
- `bun run typecheck:all`: run TypeScript checks for core and shared packages.
- `bun run lint:electron`: lint the Electron app sources.
- `bun test`: run Bun-based unit tests.
- `bun run viewer:dev`: start the session viewer app.

## Coding Style & Naming Conventions
TypeScript is used throughout. Match existing patterns, favor clear naming, and avoid unnecessary abstraction. ESLint is configured at `apps/electron/eslint.config.mjs`; run `bun run lint:electron` before shipping UI changes. Branch names follow `feature/*`, `fix/*`, `refactor/*`, and `docs/*` patterns.

## Testing Guidelines
Unit tests live in `__tests__/` folders and use `*.test.ts` naming. Run `bun test` locally before submitting changes, and update tests when shared behavior changes.

## Commit & Pull Request Guidelines
Commit messages use short Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, `docs:`). Pull requests should include a summary, testing notes, and screenshots for UI work. Link relevant issues when applicable.

## Security & Configuration Tips
OAuth integrations rely on a local `.env` file; never commit credentials. Runtime configuration is stored in `~/.claude-code-desktop/`, so handle logs and exported configs carefully.
