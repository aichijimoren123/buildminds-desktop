/**
 * Re-export all types from @claude-code-desktop/core
 */

// Workspace and config types
export type {
    AuthType, McpAuthType, OAuthCredentials, ProviderType, StoredConfig, Workspace
} from './workspace.ts';

// Provider configurations
export { PROVIDER_CONFIGS } from './workspace.ts';

// Session types
export type {
    Session, SessionMetadata,
    SessionStatus, StoredSession
} from './session.ts';

// Message types
export { generateMessageId } from './message.ts';
export type {
    AgentEvent, AgentEventUsage, AttachmentType, AuthRequestType,
    AuthStatus, ContentBadge,
    // Auth-related types
    CredentialInputMode, Message, MessageAttachment, MessageRole, PermissionRequest, RecoveryAction, StoredAttachment, StoredMessage,
    TokenUsage, ToolStatus, TypedError
} from './message.ts';

