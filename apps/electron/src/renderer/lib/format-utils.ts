/**
 * Shared formatting utilities
 *
 * Consolidates duplicate formatting functions from:
 * - ActiveTasksBar.tsx
 * - ChatDisplay.tsx
 * - TaskActionMenu.tsx
 * - FreeFormInput.tsx
 * - slash-command-menu.tsx
 */

/**
 * Format elapsed seconds in compact format: "45s", "1m 30s", "1h 5m"
 * Used in task badges and progress indicators
 */
export function formatElapsedCompact(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Format elapsed seconds in timer format: "45s", "1:30", "1:05:30"
 * Used in processing indicators for cleaner display
 */
export function formatElapsedTimer(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Shorten an ID for compact display (show first N chars)
 * @param id - The ID to shorten
 * @param length - Maximum length before truncating (default: 8)
 */
export function shortenId(id: string, length = 8): string {
  return id.length > length ? `${id.slice(0, length)}...` : id
}

/**
 * Format a file path for display, shortening home directory to ~
 * @param path - The file path to format
 * @param homeDir - The user's home directory path
 */
export function formatPathForDisplay(path: string, homeDir?: string): string {
  if (homeDir && path.startsWith(homeDir)) {
    return '~' + path.slice(homeDir.length)
  }
  return path
}

/**
 * Format a file path with "in" prefix for working directory display
 * @param path - The file path to format
 * @param homeDir - The user's home directory path
 */
export function formatWorkingDirectory(path: string, homeDir?: string): string {
  let displayPath = path
  if (homeDir && path.startsWith(homeDir)) {
    const relativePath = path.slice(homeDir.length)
    displayPath = relativePath || '/'
  }
  return `in ${displayPath}`
}

/**
 * Get the folder name from a path
 * @param path - The file path
 */
export function getFolderName(path: string): string {
  return path.split('/').pop() || path
}
