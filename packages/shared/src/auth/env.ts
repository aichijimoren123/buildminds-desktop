/**
 * Auth environment variable management
 *
 * Centralizes the pattern of setting/clearing environment variables
 * when switching between authentication modes.
 */

import type { AuthType } from '../config/storage.ts';
import { getApiBaseUrl } from '../config/storage.ts';

export interface ApiKeyCredentials {
  apiKey: string;
}

export interface ClaudeMaxCredentials {
  oauthToken: string;
}

export type AuthCredentials =
  | { type: 'api_key'; credentials: ApiKeyCredentials }
  | { type: 'oauth_token'; credentials: ClaudeMaxCredentials };

/**
 * Set environment variables for the specified auth type.
 *
 * This clears conflicting env vars and sets the appropriate ones
 * for the selected authentication mode.
 *
 * Also sets ANTHROPIC_BASE_URL if a custom API base URL is configured.
 *
 * @param auth - The auth type and credentials to configure
 */
export function setAuthEnvironment(auth: AuthCredentials): void {
  // Clear all auth-related env vars first
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  delete process.env.ANTHROPIC_BASE_URL;

  switch (auth.type) {
    case 'api_key':
      process.env.ANTHROPIC_API_KEY = auth.credentials.apiKey;
      break;

    case 'oauth_token':
      process.env.CLAUDE_CODE_OAUTH_TOKEN = auth.credentials.oauthToken;
      break;
  }

  // Set custom API base URL if configured
  const customBaseUrl = getApiBaseUrl();
  if (customBaseUrl) {
    process.env.ANTHROPIC_BASE_URL = customBaseUrl;
  }
}

/**
 * Clear all auth-related environment variables.
 */
export function clearAuthEnvironment(): void {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.CLAUDE_CODE_OAUTH_TOKEN;
  delete process.env.ANTHROPIC_BASE_URL;
}
