/**
 * Re-export all types from @claude-code-desktop/core
 */

// Workspace and config types
export type {
  Workspace,
  McpAuthType,
  AuthType,
  OAuthCredentials,
  StoredConfig,
  ProviderType,
} from './workspace.ts';

// Provider configurations
export { PROVIDER_CONFIGS } from './workspace.ts';

// Session types
export type {
  Session,
  StoredSession,
  SessionMetadata,
  SessionStatus,
} from './session.ts';

// Message types
export type {
  MessageRole,
  ToolStatus,
  AttachmentType,
  MessageAttachment,
  StoredAttachment,
  ContentBadge,
  Message,
  StoredMessage,
  TokenUsage,
  AgentEventUsage,
  RecoveryAction,
  TypedError,
  PermissionRequest,
  AgentEvent,
  // Auth-related types
  CredentialInputMode,
  AuthRequestType,
  AuthStatus,
} from './message.ts';
export { generateMessageId } from './message.ts';

