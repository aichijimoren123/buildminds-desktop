/**
 * Centralized path configuration.
 *
 * Supports multi-instance development via APP_CONFIG_DIR environment variable.
 * When running from a numbered folder, the detect-instance.sh script sets
 * APP_CONFIG_DIR to allow multiple instances to run simultaneously.
 *
 * Default: ~/.claude-code-desktop/
 * Instance 1: ~/.claude-code-desktop-1/
 * Instance 2: ~/.claude-code-desktop-2/
 */

import { homedir } from 'os';
import { join } from 'path';
import { CONFIG_DIR_NAME } from '../branding.ts';

// Allow override via environment variable for multi-instance dev
// Falls back to default config dir for production
export const CONFIG_DIR = process.env.APP_CONFIG_DIR || process.env.CRAFT_CONFIG_DIR || join(homedir(), CONFIG_DIR_NAME);
