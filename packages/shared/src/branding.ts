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
// LOGO EXPORTS
// ============================================================

/** ASCII art logo for terminal/console display */
export const CLAUDE_CODE_LOGO = [
  '  ██████ ██       █████  ██    ██ ██████  ███████ ',
  ' ██      ██      ██   ██ ██    ██ ██   ██ ██      ',
  ' ██      ██      ███████ ██    ██ ██   ██ █████   ',
  ' ██      ██      ██   ██ ██    ██ ██   ██ ██      ',
  '  ██████ ███████ ██   ██  ██████  ██████  ███████ ',
] as const;

/** Logo as a single string for HTML templates */
export const CLAUDE_CODE_LOGO_HTML = CLAUDE_CODE_LOGO.map((line) => line.trimEnd()).join('\n');

/** @deprecated Use CLAUDE_CODE_LOGO instead */
export const CRAFT_LOGO = CLAUDE_CODE_LOGO;

/** @deprecated Use CLAUDE_CODE_LOGO_HTML instead */
export const CRAFT_LOGO_HTML = CLAUDE_CODE_LOGO_HTML;

/** Session viewer base URL - set to empty if not using viewer */
export const VIEWER_URL = '';
