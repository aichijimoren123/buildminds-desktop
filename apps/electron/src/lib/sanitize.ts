/**
 * Sanitization Utilities
 *
 * Consolidated sanitization functions for various contexts:
 * - Text content (titles, previews)
 * - Filenames
 * - SVG content (XSS prevention)
 * - URLs
 */

/**
 * Sanitize text content for display (titles, previews).
 * Strips XML/HTML tags, edit requests, and collapses whitespace.
 *
 * @param content - Raw text content that may contain XML/HTML
 * @returns Clean text suitable for display
 */
export function sanitizeTextContent(content: string): string {
  return content
    .replace(/<edit_request>[\s\S]*?<\/edit_request>/g, '') // Strip entire edit_request blocks
    .replace(/<[^>]+>/g, '')     // Strip remaining XML/HTML tags
    .replace(/\s+/g, ' ')        // Collapse whitespace
    .trim()
}

/**
 * Sanitize a filename to prevent path traversal and filesystem issues.
 * Removes dangerous characters and limits length.
 *
 * @param name - Unsanitized filename
 * @returns Safe filename for filesystem operations
 */
export function sanitizeFilename(name: string): string {
  return name
    // Remove path separators and traversal patterns
    .replace(/[/\\]/g, '_')
    // Remove Windows-forbidden characters: < > : " | ? *
    .replace(/[<>:"|?*]/g, '_')
    // Remove control characters (ASCII 0-31)
    .replace(/[\x00-\x1f]/g, '')
    // Collapse multiple dots (prevent hidden files and extension tricks)
    .replace(/\.{2,}/g, '.')
    // Remove leading/trailing dots and spaces (Windows issues)
    .replace(/^[.\s]+|[.\s]+$/g, '')
    // Limit length (200 chars is safe for all filesystems)
    .slice(0, 200)
    // Fallback if name is empty after sanitization
    || 'unnamed'
}

/**
 * Sanitize SVG content for safe rendering (basic XSS prevention).
 * Removes script tags, event handlers, and javascript: URLs.
 * Also removes width/height attributes to allow CSS sizing.
 *
 * @param svg - Raw SVG content
 * @returns Sanitized SVG safe for innerHTML
 */
export function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\s+width="[^"]*"/gi, '')      // Remove width attribute
    .replace(/\s+height="[^"]*"/gi, '')     // Remove height attribute
}

/**
 * Sanitize a URL, removing dev-mode localhost URLs.
 * Returns undefined if the URL should not be used.
 *
 * @param url - URL to sanitize (may be undefined)
 * @returns Sanitized URL or undefined if invalid/dev-only
 */
export function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined

  // Remove localhost URLs (from dev mode) - they won't work in production
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return undefined
  }

  return url
}
