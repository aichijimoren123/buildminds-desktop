/**
 * Re-export PreviewHeader components from @claude-code-desktop/ui
 *
 * This provides backwards compatibility for existing Electron components.
 * The actual implementation is now in the shared UI package.
 */

export {
    PREVIEW_BADGE_VARIANTS as BADGE_VARIANTS, PreviewHeader as WindowHeader,
    PreviewHeaderBadge as WindowHeaderBadge, type PreviewBadgeVariant as BadgeVariant, type PreviewHeaderBadgeProps as WindowHeaderBadgeProps, type PreviewHeaderProps as WindowHeaderProps
} from '@claude-code-desktop/ui';

