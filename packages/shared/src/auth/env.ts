/**
 * Auth environment variable management
 *
 * Centralizes the pattern of setting/clearing environment variables
 * for API key authentication.
 */

import { getApiBaseUrl } from '../config/storage.ts';

export interface ApiKeyCredentials {
  apiKey: string;
}

/**
 * Set environment variables for API key authentication.
 *
 * This sets the ANTHROPIC_API_KEY env var and optionally
 * ANTHROPIC_BASE_URL if a custom API base URL is configured.
 *
 * @param credentials - The API key credentials to configure
 */
export function setAuthEnvironment(credentials: ApiKeyCredentials): void {
  // Clear auth-related env vars first
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_BASE_URL;

  // Set API key
  process.env.ANTHROPIC_API_KEY = credentials.apiKey;

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
  delete process.env.ANTHROPIC_BASE_URL;
}
