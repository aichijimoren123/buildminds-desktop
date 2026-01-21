import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Spinner } from "@claude-code-desktop/ui"
import { CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff, Plug, XCircle } from "lucide-react"
import { useState } from "react"
import type { BillingMethod } from "./BillingMethodStep"
import { BackButton, ContinueButton, StepFormLayout, type StepIconVariant } from "./primitives"

export type CredentialStatus = 'idle' | 'validating' | 'success' | 'error'
export type TestStatus = 'idle' | 'testing' | 'success' | 'error'

export interface ApiCredentials {
  apiKey: string
  baseUrl?: string
}

interface CredentialsStepProps {
  billingMethod: BillingMethod
  status: CredentialStatus
  errorMessage?: string
  onSubmit: (credential: string, baseUrl?: string) => void
  onTestConnection?: (apiKey: string, baseUrl?: string) => Promise<{ success: boolean; error?: string }>
  onStartOAuth?: () => void
  onBack: () => void
  onSkip?: () => void  // Skip API configuration
  // Claude OAuth specific
  existingClaudeToken?: string | null
  isClaudeCliInstalled?: boolean
  onUseExistingClaudeToken?: () => void
  // Two-step OAuth flow
  isWaitingForCode?: boolean
  onSubmitAuthCode?: (code: string) => void
  onCancelOAuth?: () => void
}

function getOAuthIcon(status: CredentialStatus): React.ReactNode {
  switch (status) {
    case 'idle': return undefined
    case 'validating': return <Spinner className="text-2xl" />
    case 'success': return <CheckCircle2 />
    case 'error': return <XCircle />
  }
}

function getOAuthIconVariant(status: CredentialStatus): StepIconVariant {
  switch (status) {
    case 'idle': return 'primary'
    case 'validating': return 'loading'
    case 'success': return 'success'
    case 'error': return 'error'
  }
}

const OAUTH_STATUS_CONTENT: Record<CredentialStatus, { title: string; description: string }> = {
  idle: {
    title: 'Connect Claude Account',
    description: 'Use your Claude subscription to power multi-agent workflows.',
  },
  validating: {
    title: 'Connecting...',
    description: 'Waiting for authentication to complete...',
  },
  success: {
    title: 'Connected!',
    description: 'Your Claude account is connected.',
  },
  error: {
    title: 'Connection failed',
    description: '', // Will use errorMessage prop
  },
}

/**
 * CredentialsStep - Enter API key or start OAuth flow
 *
 * For API Key: Shows input field with validation
 * For Claude OAuth: Shows button to start OAuth flow
 */
export function CredentialsStep({
  billingMethod,
  status,
  errorMessage,
  onSubmit,
  onTestConnection,
  onStartOAuth,
  onBack,
  onSkip,
  existingClaudeToken,
  isClaudeCliInstalled,
  onUseExistingClaudeToken,
  // Two-step OAuth flow
  isWaitingForCode,
  onSubmitAuthCode,
  onCancelOAuth,
}: CredentialsStepProps) {
  const [value, setValue] = useState('')
  const [showValue, setShowValue] = useState(false)
  const [authCode, setAuthCode] = useState('')
  // Custom API settings
  const [baseUrl, setBaseUrl] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [testError, setTestError] = useState<string | undefined>()

  const isApiKey = billingMethod === 'api_key'
  const isOAuth = billingMethod === 'claude_oauth'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim(), baseUrl.trim() || undefined)
    }
  }

  const handleTestConnection = async () => {
    if (!value.trim() || !onTestConnection) return

    setTestStatus('testing')
    setTestError(undefined)

    try {
      const result = await onTestConnection(value.trim(), baseUrl.trim() || undefined)
      if (result.success) {
        setTestStatus('success')
      } else {
        setTestStatus('error')
        setTestError(result.error || 'Connection test failed')
      }
    } catch (error) {
      setTestStatus('error')
      setTestError(error instanceof Error ? error.message : 'Connection test failed')
    }
  }

  // Handle auth code submission
  const handleAuthCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (authCode.trim() && onSubmitAuthCode) {
      onSubmitAuthCode(authCode.trim())
    }
  }

  // OAuth flow
  if (isOAuth) {
    const content = OAUTH_STATUS_CONTENT[status]

    // Check if we have existing token from keychain
    const hasExistingToken = !!existingClaudeToken

    // Waiting for authorization code entry
    if (isWaitingForCode) {
      return (
        <StepFormLayout
          title="Enter Authorization Code"
          description="Copy the code from the browser page and paste it below."
          actions={
            <>
              <BackButton onClick={onCancelOAuth} disabled={status === 'validating'}>Cancel</BackButton>
              <ContinueButton
                type="submit"
                form="auth-code-form"
                disabled={!authCode.trim()}
                loading={status === 'validating'}
                loadingText="Connecting..."
              />
            </>
          }
        >
          <form id="auth-code-form" onSubmit={handleAuthCodeSubmit}>
            <div className="space-y-2">
              <Label htmlFor="auth-code">Authorization Code</Label>
              <div className={cn(
                "relative rounded-md shadow-minimal transition-colors",
                "bg-foreground-2 focus-within:bg-background"
              )}>
                <Input
                  id="auth-code"
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Paste your authorization code here"
                  className={cn(
                    "border-0 bg-transparent shadow-none font-mono text-sm",
                    status === 'error' && "focus-visible:ring-destructive"
                  )}
                  disabled={status === 'validating'}
                  autoFocus
                />
              </div>
              {status === 'error' && errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </div>
          </form>
        </StepFormLayout>
      )
    }

    const actions = (
      <>
        {status === 'idle' && (
          <>
            <BackButton onClick={onBack} />
            {hasExistingToken ? (
              <ContinueButton onClick={onUseExistingClaudeToken} className="gap-2">
                <CheckCircle2 className="size-4" />
                Use Existing Token
              </ContinueButton>
            ) : (
              <ContinueButton onClick={onStartOAuth} className="gap-2">
                <ExternalLink className="size-4" />
                Sign in with Claude
              </ContinueButton>
            )}
          </>
        )}

        {status === 'validating' && (
          <BackButton onClick={onBack} className="w-full">Cancel</BackButton>
        )}

        {status === 'error' && (
          <>
            <BackButton onClick={onBack} />
            <ContinueButton onClick={hasExistingToken ? onUseExistingClaudeToken : onStartOAuth}>
              Try Again
            </ContinueButton>
          </>
        )}
      </>
    )

    // Dynamic description based on state
    let description = content.description
    if (status === 'idle') {
      if (hasExistingToken && existingClaudeToken) {
        // Show preview of detected token (first 20 chars)
        const tokenPreview = existingClaudeToken.length > 20
          ? `${existingClaudeToken.slice(0, 20)}...`
          : existingClaudeToken
        description = `Found existing token: ${tokenPreview}`
      } else {
        description = 'Click below to sign in with your Claude Pro or Max subscription.'
      }
    }

    return (
      <StepFormLayout
        icon={getOAuthIcon(status)}
        iconVariant={getOAuthIconVariant(status)}
        title={content.title}
        description={status === 'error' ? (errorMessage || 'Something went wrong. Please try again.') : description}
        actions={actions}
      >
        {/* Show secondary option if we have an existing token */}
        {status === 'idle' && hasExistingToken && (
          <div className="text-center">
            <button
              onClick={onStartOAuth}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Or sign in with a different account
            </button>
          </div>
        )}
      </StepFormLayout>
    )
  }

  // API Key flow
  return (
    <StepFormLayout
      title="Enter API Key"
      description={
        <>
          Get your API key from{' '}
          <a
            href="https://console.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            console.anthropic.com
          </a>
          {' '}or use a compatible API provider.
        </>
      }
      actions={
        <>
          <BackButton onClick={onBack} disabled={status === 'validating'} />
          <ContinueButton
            type="submit"
            form="api-key-form"
            disabled={!value.trim() || testStatus === 'testing'}
            loading={status === 'validating'}
            loadingText="Validating..."
          />
        </>
      }
    >
      <form id="api-key-form" onSubmit={handleSubmit} className="space-y-4">
        {/* API Key Input */}
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className={cn(
            "relative rounded-md shadow-minimal transition-colors",
            "bg-foreground-2 focus-within:bg-background"
          )}>
            <Input
              id="api-key"
              type={showValue ? 'text' : 'password'}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setTestStatus('idle')
                setTestError(undefined)
              }}
              placeholder="sk-ant-..."
              className={cn(
                "pr-10 border-0 bg-transparent shadow-none",
                status === 'error' && "focus-visible:ring-destructive"
              )}
              disabled={status === 'validating'}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowValue(!showValue)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showValue ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAdvanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          Advanced Settings
        </button>

        {/* Base URL Input (Advanced) */}
        {showAdvanced && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <Label htmlFor="base-url">API Base URL (Optional)</Label>
            <div className={cn(
              "relative rounded-md shadow-minimal transition-colors",
              "bg-foreground-2 focus-within:bg-background"
            )}>
              <Input
                id="base-url"
                type="text"
                value={baseUrl}
                onChange={(e) => {
                  setBaseUrl(e.target.value)
                  setTestStatus('idle')
                  setTestError(undefined)
                }}
                placeholder="https://api.anthropic.com (default)"
                className="border-0 bg-transparent shadow-none text-sm"
                disabled={status === 'validating'}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to use official Anthropic API. Enter a custom URL for compatible providers.
            </p>
          </div>
        )}

        {/* Test Connection Button */}
        {onTestConnection && value.trim() && (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing' || status === 'validating'}
              className="gap-2"
            >
              {testStatus === 'testing' ? (
                <Spinner className="size-4" />
              ) : testStatus === 'success' ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : testStatus === 'error' ? (
                <XCircle className="size-4 text-destructive" />
              ) : (
                <Plug className="size-4" />
              )}
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
            {testStatus === 'success' && (
              <span className="text-sm text-success">Connection successful!</span>
            )}
          </div>
        )}

        {/* Error Messages */}
        {(status === 'error' && errorMessage) && (
          <p className="text-sm text-destructive">{errorMessage}</p>
        )}
        {testStatus === 'error' && testError && (
          <p className="text-sm text-destructive">{testError}</p>
        )}

        {/* Skip option */}
        {onSkip && (
          <div className="pt-2 text-center border-t border-border/50">
            <button
              type="button"
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now — configure later in Settings
            </button>
          </div>
        )}
      </form>
    </StepFormLayout>
  )
}
