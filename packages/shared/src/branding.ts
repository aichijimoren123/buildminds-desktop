/**
 * Centralized branding configuration
 * Change these values to customize your app's branding
 */

// ============================================================
// BRANDING CONFIGURATION - Edit these values to customize
// ============================================================

/** Application name (shown in window titles, menus, etc.) */
export const APP_NAME = 'Claude Code Desktop';

/** Short name for file paths and config directories */
export const APP_SLUG = 'claude-code-desktop';

/** Deep link URL scheme (e.g., "claudecode://") */
export const DEEPLINK_SCHEME = 'claudecode';

/** Config directory name (stored in user's home: ~/.claude-code-desktop/) */
export const CONFIG_DIR_NAME = `.${APP_SLUG}`;

// ============================================================
// LEGACY EXPORTS - For backward compatibility
// ============================================================

/** @deprecated Use APP_NAME instead */
export const CRAFT_LOGO = [
  '  ██████ ██       █████  ██    ██ ██████  ███████ ',
  ' ██      ██      ██   ██ ██    ██ ██   ██ ██      ',
  ' ██      ██      ███████ ██    ██ ██   ██ █████   ',
  ' ██      ██      ██   ██ ██    ██ ██   ██ ██      ',
  '  ██████ ███████ ██   ██  ██████  ██████  ███████ ',
] as const;

/** Logo as a single string for HTML templates */
export const CRAFT_LOGO_HTML = CRAFT_LOGO.map((line) => line.trimEnd()).join('\n');

/** Session viewer base URL - set to empty if not using viewer */
export const VIEWER_URL = '';
