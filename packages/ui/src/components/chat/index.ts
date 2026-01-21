/**
 * Chat component exports for @claude-code-desktop/ui
 */

// Turn utilities (pure functions, no React)
export * from './turn-utils'

// Components
export { SessionViewer, type SessionViewerMode, type SessionViewerProps } from './SessionViewer'
export { SystemMessage, type SystemMessageProps, type SystemMessageType } from './SystemMessage'
export { ResponseCard, TurnCard, type ActivityItem, type ResponseCardProps, type ResponseContent, type TodoItem, type TurnCardProps } from './TurnCard'
export { TurnCardActionsMenu, type TurnCardActionsMenuProps } from './TurnCardActionsMenu'
export { UserMessageBubble, type UserMessageBubbleProps } from './UserMessageBubble'

// Attachment helpers
export { FileTypeIcon, getFileTypeLabel, type FileTypeIconProps } from './attachment-helpers'

// Accept plan dropdown (for plan cards)
export { AcceptPlanDropdown } from './AcceptPlanDropdown'
