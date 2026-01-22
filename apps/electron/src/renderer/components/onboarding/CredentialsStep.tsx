import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, CheckCircle2, XCircle, Plug, ChevronDown, ChevronUp } from "lucide-react"
import { Spinner } from "@claude-code-desktop/ui"
import { StepFormLayout, BackButton, ContinueButton } from "./primitives"

export type CredentialStatus = 'idle' | 'validating' | 'success' | 'error'
export type TestStatus = 'idle' | 'testing' | 'success' | 'error'

export interface ApiCredentials {
  apiKey: string
  baseUrl?: string
}

interface CredentialsStepProps {
  status: CredentialStatus
  errorMessage?: string
  onSubmit: (credential: string, baseUrl?: string) => void
  onTestConnection?: (apiKey: string, baseUrl?: string) => Promise<{ success: boolean; error?: string }>
  onBack: () => void
  onSkip?: () => void  // Skip API configuration
}

/**
 * CredentialsStep - Enter API key and optional custom base URL
 *
 * Shows input fields for API key and optional custom API base URL,
 * with connection testing capability.
 */
export function CredentialsStep({
  status,
  errorMessage,
  onSubmit,
  onTestConnection,
  onBack,
  onSkip,
}: CredentialsStepProps) {
  const [value, setValue] = useState('')
  const [showValue, setShowValue] = useState(false)
  // Custom API settings
  const [baseUrl, setBaseUrl] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [testError, setTestError] = useState<string | undefined>()

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
