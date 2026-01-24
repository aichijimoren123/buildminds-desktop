/**
 * SessionArtifactsPanel - Panel showing file changes (artifacts) from a session
 *
 * Displays all Edit, Write, and MultiEdit tool executions from the session,
 * allowing users to see a summary of file modifications and click to view diffs.
 */

import * as React from 'react'
import { useState, useMemo } from 'react'
import { PanelHeader } from '../app-shell/PanelHeader'
import { useSession as useSessionData, useAppShellContext } from '@/context/AppShellContext'
import { FileText, PencilLine, FilePlus, AlertCircle, ChevronRight } from 'lucide-react'
import {
  DiffPreviewOverlay,
  truncateFilePath,
} from '@claude-code-desktop/ui'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

export interface SessionArtifactsPanelProps {
  sessionId?: string
  closeButton?: React.ReactNode
}

/**
 * Artifact item extracted from tool messages
 */
interface ArtifactItem {
  id: string
  filePath: string
  toolType: 'Edit' | 'Write' | 'MultiEdit'
  original: string
  modified: string
  error?: string
  timestamp: number
}

/**
 * Grouped artifacts by file path
 */
interface GroupedArtifact {
  filePath: string
  items: ArtifactItem[]
  hasError: boolean
  lastTimestamp: number
}

/**
 * Extract artifacts from session messages
 */
function extractArtifacts(messages: Array<{
  id: string
  role: string
  toolName?: string
  toolUseId?: string
  toolInput?: Record<string, unknown>
  toolResult?: string
  toolStatus?: string
  timestamp: number
}>): ArtifactItem[] {
  const toolNames = ['Edit', 'Write', 'MultiEdit']

  return messages
    .filter(m => m.role === 'tool' && m.toolName && toolNames.includes(m.toolName))
    .map(m => {
      const toolType = m.toolName as 'Edit' | 'Write' | 'MultiEdit'
      const filePath = (m.toolInput?.file_path as string) || 'unknown'

      let original = ''
      let modified = ''

      if (toolType === 'Edit') {
        original = (m.toolInput?.old_string as string) || ''
        modified = (m.toolInput?.new_string as string) || ''
      } else if (toolType === 'Write') {
        original = ''
        modified = (m.toolInput?.content as string) || ''
      } else if (toolType === 'MultiEdit') {
        // MultiEdit has an array of edits - combine them for display
        const edits = (m.toolInput?.edits as Array<{ old_string?: string; new_string?: string }>) || []
        original = edits.map(e => e.old_string || '').join('\n...\n')
        modified = edits.map(e => e.new_string || '').join('\n...\n')
      }

      return {
        id: m.toolUseId || m.id,
        filePath,
        toolType,
        original,
        modified,
        error: m.toolStatus === 'error' ? m.toolResult : undefined,
        timestamp: m.timestamp,
      }
    })
}

/**
 * Group artifacts by file path
 */
function groupArtifactsByFile(artifacts: ArtifactItem[]): GroupedArtifact[] {
  const grouped = new Map<string, ArtifactItem[]>()

  for (const artifact of artifacts) {
    const existing = grouped.get(artifact.filePath) || []
    existing.push(artifact)
    grouped.set(artifact.filePath, existing)
  }

  return Array.from(grouped.entries())
    .map(([filePath, items]) => ({
      filePath,
      items: items.sort((a, b) => a.timestamp - b.timestamp),
      hasError: items.some(i => i.error),
      lastTimestamp: Math.max(...items.map(i => i.timestamp)),
    }))
    .sort((a, b) => b.lastTimestamp - a.lastTimestamp)
}

/**
 * Get icon for tool type
 */
function getToolIcon(toolType: 'Edit' | 'Write' | 'MultiEdit') {
  switch (toolType) {
    case 'Edit':
    case 'MultiEdit':
      return PencilLine
    case 'Write':
      return FilePlus
    default:
      return FileText
  }
}

/**
 * Artifact row component
 */
function ArtifactRow({
  artifact,
  onClick,
  isExpanded,
  onToggleExpand,
  showExpand,
}: {
  artifact: ArtifactItem
  onClick: () => void
  isExpanded?: boolean
  onToggleExpand?: () => void
  showExpand?: boolean
}) {
  const Icon = getToolIcon(artifact.toolType)

  return (
    <button
      className={cn(
        'w-full text-left px-3 py-2 hover:bg-foreground-2 transition-colors flex items-center gap-2',
        artifact.error && 'text-destructive'
      )}
      onClick={onClick}
    >
      {showExpand && (
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0',
            isExpanded && 'rotate-90'
          )}
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.()
          }}
        />
      )}
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate flex-1 text-sm">
        {truncateFilePath(artifact.filePath)}
      </span>
      {artifact.error && (
        <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
      )}
    </button>
  )
}

/**
 * Grouped artifact section
 */
function GroupedArtifactSection({
  group,
  onSelectArtifact,
}: {
  group: GroupedArtifact
  onSelectArtifact: (artifact: ArtifactItem) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasMultiple = group.items.length > 1

  if (!hasMultiple) {
    return (
      <ArtifactRow
        artifact={group.items[0]}
        onClick={() => onSelectArtifact(group.items[0])}
        showExpand={false}
      />
    )
  }

  return (
    <div>
      <button
        className={cn(
          'w-full text-left px-3 py-2 hover:bg-foreground-2 transition-colors flex items-center gap-2',
          group.hasError && 'text-destructive'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0',
            isExpanded && 'rotate-90'
          )}
        />
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate flex-1 text-sm">
          {truncateFilePath(group.filePath)}
        </span>
        <span className="text-xs text-muted-foreground bg-foreground-3 px-1.5 py-0.5 rounded shrink-0">
          {group.items.length}
        </span>
        {group.hasError && (
          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
        )}
      </button>
      {isExpanded && (
        <div className="pl-4 border-l border-border ml-5">
          {group.items.map((artifact) => (
            <ArtifactRow
              key={artifact.id}
              artifact={artifact}
              onClick={() => onSelectArtifact(artifact)}
              showExpand={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Panel displaying session artifacts (file changes)
 */
export function SessionArtifactsPanel({ sessionId, closeButton }: SessionArtifactsPanelProps) {
  const { onOpenFile } = useAppShellContext()
  const { isDark } = useTheme()
  const session = useSessionData(sessionId || '')

  // State for diff overlay
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactItem | null>(null)

  // Extract and group artifacts
  const groupedArtifacts = useMemo(() => {
    if (!session?.messages) return []
    const artifacts = extractArtifacts(session.messages)
    return groupArtifactsByFile(artifacts)
  }, [session?.messages])

  const totalChanges = useMemo(() => {
    return groupedArtifacts.reduce((sum, g) => sum + g.items.length, 0)
  }, [groupedArtifacts])

  // Handle artifact click
  const handleSelectArtifact = (artifact: ArtifactItem) => {
    setSelectedArtifact(artifact)
  }

  // Handle close diff overlay
  const handleCloseDiff = () => {
    setSelectedArtifact(null)
  }

  // Handle open file in external editor
  const handleOpenFile = (filePath: string) => {
    onOpenFile(filePath)
  }

  // Early return if no sessionId
  if (!sessionId) {
    return (
      <div className="h-full flex flex-col">
        <PanelHeader title="Artifacts" actions={closeButton} />
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
          <p className="text-sm text-center">No session selected</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-full flex flex-col">
        <PanelHeader title="Artifacts" actions={closeButton} />
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
          <p className="text-sm text-center">Loading session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <PanelHeader
        title="Artifacts"
        badge={totalChanges > 0 ? (
          <span className="text-xs text-muted-foreground bg-foreground-3 px-1.5 py-0.5 rounded">
            {totalChanges}
          </span>
        ) : undefined}
        actions={closeButton}
      />

      {/* Artifacts list */}
      <div className="flex-1 overflow-auto">
        {groupedArtifacts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
            <FileText className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm">No file changes in this session</p>
            <p className="text-xs mt-1 opacity-75">
              File edits and writes will appear here
            </p>
          </div>
        ) : (
          <div className="py-1">
            {groupedArtifacts.map((group) => (
              <GroupedArtifactSection
                key={group.filePath}
                group={group}
                onSelectArtifact={handleSelectArtifact}
              />
            ))}
          </div>
        )}
      </div>

      {/* Diff preview overlay */}
      <DiffPreviewOverlay
        isOpen={!!selectedArtifact}
        onClose={handleCloseDiff}
        original={selectedArtifact?.original || ''}
        modified={selectedArtifact?.modified || ''}
        filePath={selectedArtifact?.filePath || ''}
        theme={isDark ? 'dark' : 'light'}
        error={selectedArtifact?.error}
        onOpenFile={handleOpenFile}
      />
    </div>
  )
}
