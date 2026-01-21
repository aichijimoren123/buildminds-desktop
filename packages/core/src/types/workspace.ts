/**
 * Workspace and authentication types
 */

/**
 * How MCP server should be authenticated (workspace-level)
 * Note: Different from SourceMcpAuthType which uses 'oauth' | 'bearer' | 'none' for individual sources
 */
export type McpAuthType = 'workspace_oauth' | 'workspace_bearer' | 'public';

export interface Workspace {
  id: string;
  name: string;            // Read from workspace folder config (not stored in global config)
  rootPath: string;        // Absolute path to workspace folder (e.g., ~/Projects/my-app/claude-code-desktop)
  createdAt: number;
  lastAccessedAt?: number; // For sorting recent workspaces
  iconUrl?: string;
  mcpUrl?: string;
  mcpAuthType?: McpAuthType;
}

export type AuthType = 'api_key' | 'oauth_token';

/**
 * API Provider types
 * - anthropic: Official Anthropic API
 * - openrouter: OpenRouter proxy service
 * - custom: Custom API endpoint (e.g., Azure, other proxies)
 */
export type ProviderType = 'anthropic' | 'openrouter' | 'custom';

/**
 * Provider configuration with preset base URLs
 */
export const PROVIDER_CONFIGS: Record<ProviderType, { name: string; baseUrl?: string; placeholder: string }> = {
  anthropic: {
    name: 'Anthropic (Official)',
    baseUrl: undefined, // Uses SDK default
    placeholder: 'sk-ant-...',
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    placeholder: 'sk-or-...',
  },
  custom: {
    name: 'Custom Provider',
    baseUrl: undefined, // User must specify
    placeholder: 'Enter your API key',
  },
};

/**
 * OAuth credentials from a fresh authentication flow.
 * Used for temporary state in UI components before saving to credential store.
 */
export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  clientId: string;
  tokenType: string;
}

// Config stored in JSON file (credentials stored in encrypted file, not here)
export interface StoredConfig {
  authType?: AuthType;
  provider?: ProviderType;  // API provider type
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeSessionId: string | null;  // Currently active session (primary scope)
  model?: string;
  apiBaseUrl?: string;  // Custom API base URL (e.g., for third-party Anthropic-compatible APIs)
}

