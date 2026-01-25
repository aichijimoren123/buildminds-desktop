/**
 * SidebarSessionList - Compact session list for integrated layout mode
 *
 * Displays sessions directly under the "All Chats" section in the sidebar when
 * in integrated layout mode. Features:
 * - Compact filter dropdown (All / Backlog / Todo / Done / Flagged / etc.)
 * - Simplified session items (title only, no date grouping)
 * - Context menu for session actions
 * - Keyboard navigation support
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { ChevronDown, Flag, Check, Search, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { cn, isHexColor } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TodoStateMenu } from '@/components/ui/todo-filter-menu'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  StyledDropdownMenuContent,
  StyledDropdownMenuItem,
  StyledDropdownMenuSeparator,
} from '@/components/ui/styled-dropdown'
import {
  ContextMenu,
  ContextMenuTrigger,
  StyledContextMenuContent,
} from '@/components/ui/styled-context-menu'
import { ContextMenuProvider } from '@/components/ui/menu-context'
import { SessionMenu } from './SessionMenu'
import { RenameDialog } from '@/components/ui/rename-dialog'

import { getSessionTitle } from '@/utils/session'
import { getStateColor, getStateIcon, type TodoStateId, type TodoState } from '@/config/todo-states'
import type { SessionMeta } from '@/atoms/sessions'
import type { ChatFilter } from '../../shared/types'

interface SidebarSessionListProps {
  sessions: SessionMeta[]
  selectedSessionId: string | null
  onSessionSelect: (session: SessionMeta) => void
  onSessionDelete: (sessionId: string) => Promise<boolean>
  onSessionFlag: (sessionId: string) => void
  onSessionUnflag: (sessionId: string) => void
  onTodoStateChange: (sessionId: string, state: string) => void
  onRename: (sessionId: string, name: string) => void
  onMarkUnread: (sessionId: string) => void
  onOpenInNewWindow?: (session: SessionMeta) => void
  todoStates: TodoState[]
  /** Current filter state */
  filter: ChatFilter
  /** Callback when filter changes */
  onFilterChange: (filter: ChatFilter) => void
}

/**
 * Get session's todo state, defaulting to 'todo'
 */
function getSessionTodoState(session: SessionMeta): TodoStateId {
  return (session.todoState as TodoStateId) || 'todo'
}

/**
 * Check if session has unread messages
 */
function hasUnreadMessages(session: SessionMeta): boolean {
  if (!session.lastFinalMessageId) return false
  return session.lastFinalMessageId !== session.lastReadMessageId
}

/**
 * Check if session has any messages
 */
function hasMessages(session: SessionMeta): boolean {
  return session.lastFinalMessageId !== undefined
}

/**
 * Compact session item for sidebar
 */
function SidebarSessionItem({
  session,
  isSelected,
  onSelect,
  onDelete,
  onFlag,
  onUnflag,
  onTodoStateChange,
  onRenameClick,
  onMarkUnread,
  onOpenInNewWindow,
  todoStates,
}: {
  session: SessionMeta
  isSelected: boolean
  onSelect: () => void
  onDelete: () => Promise<boolean>
  onFlag: () => void
  onUnflag: () => void
  onTodoStateChange: (state: TodoStateId) => void
  onRenameClick: (sessionId: string, currentName: string) => void
  onMarkUnread: () => void
  onOpenInNewWindow?: () => void
  todoStates: TodoState[]
}) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const [todoMenuOpen, setTodoMenuOpen] = useState(false)
  const currentTodoState = getSessionTodoState(session)

  const handleTodoStateSelect = (state: TodoStateId) => {
    setTodoMenuOpen(false)
    onTodoStateChange(state)
  }

  return (
    <ContextMenu modal={true} onOpenChange={setContextMenuOpen}>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            'group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer select-none',
            'transition-all duration-100 min-w-0 overflow-hidden',
            isSelected
              ? 'bg-foreground/[0.08] shadow-sm'
              : 'hover:bg-foreground/[0.05]'
          )}
          onMouseDown={onSelect}
        >
          {/* Todo state icon */}
          <Popover modal={true} open={todoMenuOpen} onOpenChange={setTodoMenuOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  'w-3.5 h-3.5 flex items-center justify-center shrink-0 cursor-pointer',
                  'hover:opacity-80',
                  !isHexColor(getStateColor(currentTodoState, todoStates)) &&
                    (getStateColor(currentTodoState, todoStates) || 'text-muted-foreground')
                )}
                style={
                  isHexColor(getStateColor(currentTodoState, todoStates))
                    ? { color: getStateColor(currentTodoState, todoStates) }
                    : undefined
                }
                onClick={(e) => {
                  e.stopPropagation()
                }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>img]:w-full [&>img]:h-full [&>span]:text-xs">
                  {getStateIcon(currentTodoState, todoStates)}
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-0 shadow-none bg-transparent"
              align="start"
              side="right"
              sideOffset={4}
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <TodoStateMenu
                activeState={currentTodoState}
                onSelect={handleTodoStateSelect}
                states={todoStates}
              />
            </PopoverContent>
          </Popover>

          {/* Session title */}
          <span className="flex-1 truncate text-[12px] text-foreground/80">
            {getSessionTitle(session)}
          </span>

          {/* Badges */}
          <div className="flex items-center gap-1 shrink-0">
            {hasUnreadMessages(session) && (
              <span className="px-1 py-0.5 text-[9px] font-medium rounded bg-accent text-white">
                New
              </span>
            )}
            {session.isFlagged && (
              <Flag className="h-2.5 w-2.5 text-info fill-info" />
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <StyledContextMenuContent>
        <ContextMenuProvider>
          <SessionMenu
            sessionId={session.id}
            sessionName={getSessionTitle(session)}
            isFlagged={session.isFlagged ?? false}
            sharedUrl={session.sharedUrl}
            hasMessages={hasMessages(session)}
            hasUnreadMessages={hasUnreadMessages(session)}
            currentTodoState={currentTodoState}
            todoStates={todoStates}
            onRename={() => onRenameClick(session.id, getSessionTitle(session))}
            onFlag={onFlag}
            onUnflag={onUnflag}
            onMarkUnread={onMarkUnread}
            onTodoStateChange={onTodoStateChange}
            onOpenInNewWindow={onOpenInNewWindow}
            onDelete={onDelete}
          />
        </ContextMenuProvider>
      </StyledContextMenuContent>
    </ContextMenu>
  )
}

/**
 * Filter dropdown button
 */
function FilterDropdown({
  filter,
  onFilterChange,
  todoStates,
  flaggedCount,
}: {
  filter: ChatFilter
  onFilterChange: (filter: ChatFilter) => void
  todoStates: TodoState[]
  flaggedCount: number
}) {
  // Get current filter label
  const getFilterLabel = () => {
    if (filter.kind === 'allChats') return 'All'
    if (filter.kind === 'flagged') return 'Flagged'
    if (filter.kind === 'state') {
      const state = todoStates.find((s) => s.id === filter.stateId)
      return state?.label || filter.stateId
    }
    return 'All'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded transition-colors">
          <span>{getFilterLabel()}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <StyledDropdownMenuContent align="start" className="min-w-[160px]">
        <StyledDropdownMenuItem onClick={() => onFilterChange({ kind: 'allChats' })}>
          <span className="flex-1">All</span>
          {filter.kind === 'allChats' && <Check className="h-3.5 w-3.5" />}
        </StyledDropdownMenuItem>
        <StyledDropdownMenuSeparator />
        {todoStates.map((state) => (
          <StyledDropdownMenuItem
            key={state.id}
            onClick={() => onFilterChange({ kind: 'state', stateId: state.id })}
          >
            <span
              className={cn(
                'h-3.5 w-3.5 flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full [&>img]:w-full [&>img]:h-full',
                state.iconColorable && !isHexColor(state.color) && state.color
              )}
              style={state.iconColorable && isHexColor(state.color) ? { color: state.color } : undefined}
            >
              {state.icon}
            </span>
            <span className="flex-1">{state.label}</span>
            {filter.kind === 'state' && filter.stateId === state.id && (
              <Check className="h-3.5 w-3.5" />
            )}
          </StyledDropdownMenuItem>
        ))}
        <StyledDropdownMenuSeparator />
        <StyledDropdownMenuItem onClick={() => onFilterChange({ kind: 'flagged' })}>
          <Flag className="h-3.5 w-3.5 fill-current text-info" />
          <span className="flex-1">Flagged</span>
          <span className="text-xs text-muted-foreground">{flaggedCount}</span>
          {filter.kind === 'flagged' && <Check className="h-3.5 w-3.5 ml-1" />}
        </StyledDropdownMenuItem>
      </StyledDropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * SidebarSessionList - Main component
 */
export function SidebarSessionList({
  sessions,
  selectedSessionId,
  onSessionSelect,
  onSessionDelete,
  onSessionFlag,
  onSessionUnflag,
  onTodoStateChange,
  onRename,
  onMarkUnread,
  onOpenInNewWindow,
  todoStates,
  filter,
  onFilterChange,
}: SidebarSessionListProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null)
  const [renameName, setRenameName] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input when activated
  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchActive])

  // Filter sessions based on current filter
  const filteredSessions = useMemo(() => {
    let result = sessions

    // Apply chat filter
    if (filter.kind === 'flagged') {
      result = result.filter((s) => s.isFlagged)
    } else if (filter.kind === 'state') {
      result = result.filter((s) => (s.todoState || 'todo') === filter.stateId)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((s) => getSessionTitle(s).toLowerCase().includes(query))
    }

    // Sort by most recent first
    return [...result].sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
  }, [sessions, filter, searchQuery])

  // Count flagged sessions
  const flaggedCount = useMemo(() => sessions.filter((s) => s.isFlagged).length, [sessions])

  const handleRenameClick = useCallback((sessionId: string, currentName: string) => {
    setRenameSessionId(sessionId)
    setRenameName(currentName)
    requestAnimationFrame(() => {
      setRenameDialogOpen(true)
    })
  }, [])

  const handleRenameSubmit = useCallback(() => {
    if (renameSessionId && renameName.trim()) {
      onRename(renameSessionId, renameName.trim())
    }
    setRenameDialogOpen(false)
    setRenameSessionId(null)
    setRenameName('')
  }, [renameSessionId, renameName, onRename])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setSearchActive(false)
      setSearchQuery('')
    }
  }

  return (
    <div className="flex flex-col min-w-0 overflow-hidden">
      {/* Header row with filter and search */}
      <div className="flex items-center justify-between px-1 py-1">
        <FilterDropdown
          filter={filter}
          onFilterChange={onFilterChange}
          todoStates={todoStates}
          flaggedCount={flaggedCount}
        />
        <button
          onClick={() => setSearchActive(!searchActive)}
          className={cn(
            'p-1 rounded transition-colors',
            searchActive ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
          )}
        >
          <Search className="h-3 w-3" />
        </button>
      </div>

      {/* Search input */}
      {searchActive && (
        <div className="px-1 pb-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search..."
              className="w-full h-7 pl-7 pr-7 text-[11px] bg-foreground/5 border-0 rounded outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-foreground/10 rounded"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Session list */}
      <div className="max-h-[300px] overflow-y-auto overflow-x-hidden px-1 min-w-0">
        {filteredSessions.length === 0 ? (
          <div className="py-4 text-center text-[11px] text-muted-foreground">
            {searchQuery ? 'No matches found' : 'No conversations'}
          </div>
        ) : (
          <div className="space-y-1 py-0.5 min-w-0">
            {filteredSessions.map((session) => (
              <SidebarSessionItem
                key={session.id}
                session={session}
                isSelected={session.id === selectedSessionId}
                onSelect={() => onSessionSelect(session)}
                onDelete={() => onSessionDelete(session.id)}
                onFlag={() => onSessionFlag(session.id)}
                onUnflag={() => onSessionUnflag(session.id)}
                onTodoStateChange={(state) => onTodoStateChange(session.id, state)}
                onRenameClick={handleRenameClick}
                onMarkUnread={() => onMarkUnread(session.id)}
                onOpenInNewWindow={onOpenInNewWindow ? () => onOpenInNewWindow(session) : undefined}
                todoStates={todoStates}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        title="Rename conversation"
        value={renameName}
        onValueChange={setRenameName}
        onSubmit={handleRenameSubmit}
        placeholder="Enter a name..."
      />
    </div>
  )
}
