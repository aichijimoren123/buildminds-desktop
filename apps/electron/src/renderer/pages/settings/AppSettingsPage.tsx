/**
 * AppSettingsPage
 *
 * Global app-level settings that apply across all workspaces.
 *
 * Settings:
 * - Appearance (Theme, Font)
 * - Notifications
 * - API Provider (Anthropic, OpenRouter, Custom)
 */

import { useState, useEffect, useCallback } from 'react'
import { PanelHeader } from '@/components/app-shell/PanelHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { HeaderMenu } from '@/components/ui/HeaderMenu'
import { useTheme } from '@/context/ThemeContext'
import { routes } from '@/lib/navigate'
import * as storage from '@/lib/local-storage'
import {
  Monitor,
  Sun,
  Moon,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  Plug,
  XCircle,
  PanelLeft,
  Columns3,
} from 'lucide-react'
import { Spinner } from '@claude-code-desktop/ui'
import type { DetailsPageMeta } from '@/lib/navigation-registry'
import { type ProviderType, PROVIDER_CONFIGS } from '@claude-code-desktop/core'

import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsToggle,
  SettingsSegmentedControl,
  SettingsMenuSelectRow,
  SettingsMenuSelect,
} from '@/components/settings'
import { useUpdateChecker } from '@/hooks/useUpdateChecker'
import { useAppShellContext } from '@/context/AppShellContext'
import type { PresetTheme } from '@config/theme'

export const meta: DetailsPageMeta = {
  navigator: 'settings',
  slug: 'app',
}

// ============================================
// Main Component
// ============================================

export default function AppSettingsPage() {
  const { mode, setMode, colorTheme, setColorTheme, setPreviewColorTheme, font, setFont } = useTheme()

  // Get workspace ID from context for loading preset themes
  const { activeWorkspaceId } = useAppShellContext()

  // Preset themes state
  const [presetThemes, setPresetThemes] = useState<PresetTheme[]>([])

  // Billing state (simplified - API key only)
  const [hasCredential, setHasCredential] = useState(false)
  const [isLoadingBilling, setIsLoadingBilling] = useState(true)

  // Provider state
  const [provider, setProvider] = useState<ProviderType>('anthropic')
  const [customBaseUrl, setCustomBaseUrl] = useState('')
  const [isSavingProvider, setIsSavingProvider] = useState(false)
  const [providerTestStatus, setProviderTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [providerTestError, setProviderTestError] = useState<string | undefined>()
  // Provider API Key state (in-place editing)
  const [providerApiKey, setProviderApiKey] = useState('')
  const [showProviderApiKey, setShowProviderApiKey] = useState(false)
  const [isSavingProviderApiKey, setIsSavingProviderApiKey] = useState(false)
  const [providerApiKeyError, setProviderApiKeyError] = useState<string | undefined>()

  // Notifications state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Layout mode state - uses localStorage directly
  type LayoutMode = 'separated' | 'integrated'
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    return storage.get(storage.KEYS.layoutMode, 'separated') as LayoutMode
  })

  // Handler for layout mode change
  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode)
    storage.set(storage.KEYS.layoutMode, mode)
    // Dispatch storage event so AppShell can react to the change
    window.dispatchEvent(new StorageEvent('storage', {
      key: storage.getKeyString(storage.KEYS.layoutMode),
      newValue: JSON.stringify(mode),
    }))
  }, [])

  // Auto-update state
  const updateChecker = useUpdateChecker()
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false)

  const handleCheckForUpdates = useCallback(async () => {
    setIsCheckingForUpdates(true)
    try {
      await updateChecker.checkForUpdates()
    } finally {
      setIsCheckingForUpdates(false)
    }
  }, [updateChecker])

  // Load current billing method, notifications setting, provider config, and preset themes on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!window.electronAPI) return
      try {
        const [billing, notificationsOn, providerConfig] = await Promise.all([
          window.electronAPI.getBillingMethod(),
          window.electronAPI.getNotificationsEnabled(),
          window.electronAPI.getProviderConfig?.() ?? Promise.resolve({ provider: 'anthropic', baseUrl: undefined }),
        ])
        setHasCredential(billing.hasCredential)
        setNotificationsEnabled(notificationsOn)
        // Load provider config
        if (providerConfig) {
          setProvider(providerConfig.provider || 'anthropic')
          setCustomBaseUrl(providerConfig.baseUrl || '')
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setIsLoadingBilling(false)
      }
    }
    loadSettings()
  }, [])

  // Load preset themes when workspace changes (themes are workspace-scoped)
  // Load preset themes (app-level, no workspace dependency)
  useEffect(() => {
    const loadThemes = async () => {
      if (!window.electronAPI) {
        setPresetThemes([])
        return
      }
      try {
        const themes = await window.electronAPI.loadPresetThemes()
        setPresetThemes(themes)
      } catch (error) {
        console.error('Failed to load preset themes:', error)
        setPresetThemes([])
      }
    }
    loadThemes()
  }, [])

  const handleNotificationsEnabledChange = useCallback(async (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    await window.electronAPI.setNotificationsEnabled(enabled)
  }, [])

  // Handle provider change
  const handleProviderChange = useCallback(async (newProvider: ProviderType) => {
    setProvider(newProvider)
    setProviderTestStatus('idle')
    setProviderTestError(undefined)

    // Get the default base URL for the provider
    const config = PROVIDER_CONFIGS[newProvider]
    const baseUrl = newProvider === 'custom' ? customBaseUrl : (config.baseUrl || '')

    // Save provider config
    setIsSavingProvider(true)
    try {
      await window.electronAPI.setProviderConfig?.(newProvider, baseUrl || undefined)
    } catch (error) {
      console.error('Failed to save provider config:', error)
    } finally {
      setIsSavingProvider(false)
    }
  }, [customBaseUrl])

  // Handle custom base URL change
  const handleCustomBaseUrlChange = useCallback(async (url: string) => {
    setCustomBaseUrl(url)
    setProviderTestStatus('idle')
    setProviderTestError(undefined)
  }, [])

  // Save custom base URL
  const handleSaveCustomBaseUrl = useCallback(async () => {
    setIsSavingProvider(true)
    try {
      await window.electronAPI.setProviderConfig?.(provider, customBaseUrl || undefined)
    } catch (error) {
      console.error('Failed to save custom base URL:', error)
    } finally {
      setIsSavingProvider(false)
    }
  }, [provider, customBaseUrl])

  // Save provider API key
  const handleSaveProviderApiKey = useCallback(async () => {
    if (!window.electronAPI || !providerApiKey.trim()) return

    setIsSavingProviderApiKey(true)
    setProviderApiKeyError(undefined)

    try {
      // Save as API key auth type
      await window.electronAPI.updateBillingMethod('api_key', providerApiKey.trim())
      setHasCredential(true)
      setProviderApiKey('') // Clear input after save
      setProviderTestStatus('idle')
    } catch (error) {
      console.error('Failed to save API key:', error)
      setProviderApiKeyError(error instanceof Error ? error.message : 'Failed to save API key')
    } finally {
      setIsSavingProviderApiKey(false)
    }
  }, [providerApiKey])

  // Test provider connection using stored credentials
  const handleTestConnection = useCallback(async () => {
    if (!window.electronAPI?.testProviderConnection) return

    setProviderTestStatus('testing')
    setProviderTestError(undefined)

    try {
      const result = await window.electronAPI.testProviderConnection()
      if (result.success) {
        setProviderTestStatus('success')
      } else {
        setProviderTestStatus('error')
        setProviderTestError(result.error || 'Connection test failed')
      }
    } catch (error) {
      setProviderTestStatus('error')
      setProviderTestError(error instanceof Error ? error.message : 'Connection test failed')
    }
  }, [])

  return (
    <div className="h-full flex flex-col">
      <PanelHeader title="App Settings" actions={<HeaderMenu route={routes.view.settings('app')} />} />
      <div className="flex-1 min-h-0 mask-fade-y">
        <ScrollArea className="h-full">
          <div className="px-5 py-7 max-w-3xl mx-auto">
          <div className="space-y-6">
            {/* Appearance */}
            <SettingsSection title="Appearance">
              <SettingsCard>
                <SettingsRow label="Mode">
                  <SettingsSegmentedControl
                    value={mode}
                    onValueChange={setMode}
                    options={[
                      { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
                      { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                      { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                    ]}
                  />
                </SettingsRow>
                <SettingsRow label="Color theme">
                  <SettingsMenuSelect
                    value={colorTheme}
                    onValueChange={setColorTheme}
                    options={[
                      { value: 'default', label: 'Default' },
                      ...presetThemes
                        .filter(t => t.id !== 'default')
                        .map(t => ({
                          value: t.id,
                          label: t.theme.name || t.id,
                        })),
                    ]}
                  />
                </SettingsRow>
                <SettingsRow label="Font">
                  <SettingsSegmentedControl
                    value={font}
                    onValueChange={setFont}
                    options={[
                      { value: 'inter', label: 'Inter' },
                      { value: 'system', label: 'System' },
                    ]}
                  />
                </SettingsRow>
              </SettingsCard>
            </SettingsSection>

            {/* Layout */}
            <SettingsSection title="Layout" description="Configure how the app interface is organized">
              <SettingsCard>
                <SettingsRow label="Panel layout">
                  <SettingsSegmentedControl
                    value={layoutMode}
                    onValueChange={(v) => handleLayoutModeChange(v as LayoutMode)}
                    options={[
                      { value: 'separated', label: 'Separated', icon: <Columns3 className="w-4 h-4" /> },
                      { value: 'integrated', label: 'Integrated', icon: <PanelLeft className="w-4 h-4" /> },
                    ]}
                  />
                </SettingsRow>
                <div className="px-4 pb-3 -mt-1">
                  <p className="text-xs text-muted-foreground">
                    {layoutMode === 'separated'
                      ? 'Three-column layout with separate session list panel.'
                      : 'Two-column layout with sessions integrated into the sidebar.'}
                  </p>
                </div>
              </SettingsCard>
            </SettingsSection>

            {/* Notifications */}
            <SettingsSection title="Notifications">
              <SettingsCard>
                <SettingsToggle
                  label="Desktop notifications"
                  description="Get notified when AI finishes working in a chat."
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationsEnabledChange}
                />
              </SettingsCard>
            </SettingsSection>

            {/* API Provider */}
            <SettingsSection title="API Provider" description="Configure your API endpoint and credentials">
              <SettingsCard>
                <SettingsMenuSelectRow
                  label="Provider"
                  description={PROVIDER_CONFIGS[provider].name}
                  value={provider}
                  onValueChange={(v) => handleProviderChange(v as ProviderType)}
                  options={[
                    { value: 'anthropic', label: 'Anthropic (Official)', description: 'Direct connection to Anthropic API' },
                    { value: 'openrouter', label: 'OpenRouter', description: 'Use OpenRouter as API proxy' },
                    { value: 'custom', label: 'Custom Provider', description: 'Configure your own API endpoint' },
                  ]}
                />
                {/* Show Base URL for OpenRouter and Custom */}
                {provider !== 'anthropic' && (
                  <SettingsRow label="Base URL">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={provider === 'openrouter' ? PROVIDER_CONFIGS.openrouter.baseUrl : customBaseUrl}
                          onChange={(e) => handleCustomBaseUrlChange(e.target.value)}
                          placeholder="https://api.example.com/v1"
                          className="flex-1"
                          disabled={provider === 'openrouter' || isSavingProvider}
                        />
                        {provider === 'custom' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveCustomBaseUrl}
                            disabled={isSavingProvider}
                          >
                            {isSavingProvider ? <Spinner className="size-4" /> : 'Save'}
                          </Button>
                        )}
                      </div>
                      {provider === 'openrouter' && (
                        <p className="text-xs text-muted-foreground">
                          OpenRouter uses a fixed endpoint. Get your API key from{' '}
                          <a
                            href="https://openrouter.ai/keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:underline"
                            onClick={(e) => {
                              e.preventDefault()
                              window.electronAPI?.openUrl('https://openrouter.ai/keys')
                            }}
                          >
                            openrouter.ai
                          </a>
                        </p>
                      )}
                    </div>
                  </SettingsRow>
                )}
                {/* API Key Input */}
                <SettingsRow label="API Key">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showProviderApiKey ? 'text' : 'password'}
                          value={providerApiKey}
                          onChange={(e) => {
                            setProviderApiKey(e.target.value)
                            setProviderTestStatus('idle')
                            setProviderTestError(undefined)
                          }}
                          placeholder={hasCredential ? '••••••••••••••••' : PROVIDER_CONFIGS[provider].placeholder}
                          className="pr-10"
                          disabled={isSavingProviderApiKey}
                        />
                        <button
                          type="button"
                          onClick={() => setShowProviderApiKey(!showProviderApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                        >
                          {showProviderApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveProviderApiKey}
                        disabled={isSavingProviderApiKey || !providerApiKey.trim()}
                      >
                        {isSavingProviderApiKey ? <Spinner className="size-4" /> : 'Save'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {provider === 'anthropic' && (
                        <>
                          Get your API key from{' '}
                          <a
                            href="https://console.anthropic.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:underline"
                            onClick={(e) => {
                              e.preventDefault()
                              window.electronAPI?.openUrl('https://console.anthropic.com')
                            }}
                          >
                            console.anthropic.com
                          </a>
                        </>
                      )}
                      {provider === 'openrouter' && (
                        <>
                          Get your API key from{' '}
                          <a
                            href="https://openrouter.ai/keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:underline"
                            onClick={(e) => {
                              e.preventDefault()
                              window.electronAPI?.openUrl('https://openrouter.ai/keys')
                            }}
                          >
                            openrouter.ai/keys
                          </a>
                        </>
                      )}
                      {provider === 'custom' && 'Enter the API key for your custom provider.'}
                    </p>
                    {providerApiKeyError && (
                      <p className="text-sm text-destructive">{providerApiKeyError}</p>
                    )}
                  </div>
                </SettingsRow>
                {/* Test Connection */}
                <SettingsRow label="Connection">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestConnection}
                        disabled={providerTestStatus === 'testing' || !hasCredential}
                        className="gap-2"
                      >
                        {providerTestStatus === 'testing' ? (
                          <Spinner className="size-4" />
                        ) : providerTestStatus === 'success' ? (
                          <CheckCircle2 className="size-4 text-success" />
                        ) : providerTestStatus === 'error' ? (
                          <XCircle className="size-4 text-destructive" />
                        ) : (
                          <Plug className="size-4" />
                        )}
                        {providerTestStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                      </Button>
                      {providerTestStatus === 'success' && (
                        <span className="text-sm text-success">Connected!</span>
                      )}
                    </div>
                    {!hasCredential && (
                      <p className="text-xs text-muted-foreground">
                        Enter your API key above to test the connection.
                      </p>
                    )}
                    {providerTestStatus === 'error' && providerTestError && (
                      <p className="text-sm text-destructive break-words">{providerTestError}</p>
                    )}
                  </div>
                </SettingsRow>
              </SettingsCard>
            </SettingsSection>

            {/* About */}
            <SettingsSection title="About">
              <SettingsCard>
                <SettingsRow label="Version">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {updateChecker.updateInfo?.currentVersion ?? 'Loading...'}
                    </span>
                    {updateChecker.updateAvailable && updateChecker.updateInfo?.latestVersion && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={updateChecker.installUpdate}
                      >
                        Update to {updateChecker.updateInfo.latestVersion}
                      </Button>
                    )}
                  </div>
                </SettingsRow>
                <SettingsRow label="Check for updates">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCheckForUpdates}
                    disabled={isCheckingForUpdates}
                  >
                    {isCheckingForUpdates ? (
                      <>
                        <Spinner className="mr-1.5" />
                        Checking...
                      </>
                    ) : (
                      'Check Now'
                    )}
                  </Button>
                </SettingsRow>
                {updateChecker.isReadyToInstall && (
                  <SettingsRow label="Install update">
                    <Button
                      size="sm"
                      onClick={updateChecker.installUpdate}
                    >
                      Restart to Update
                    </Button>
                  </SettingsRow>
                )}
              </SettingsCard>
            </SettingsSection>
          </div>
        </div>
        </ScrollArea>
      </div>
    </div>
  )
}
