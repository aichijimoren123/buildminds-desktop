import { cn } from "@/lib/utils"
import { WelcomeStep } from "./WelcomeStep"
import { CredentialsStep, type CredentialStatus } from "./CredentialsStep"
import { CompletionStep } from "./CompletionStep"

export type OnboardingStep =
  | 'welcome'
  | 'credentials'
  | 'complete'

export type LoginStatus = 'idle' | 'waiting' | 'success' | 'error'

export interface OnboardingState {
  step: OnboardingStep
  loginStatus: LoginStatus
  credentialStatus: CredentialStatus
  completionStatus: 'saving' | 'complete'
  isExistingUser: boolean
  errorMessage?: string
}

interface OnboardingWizardProps {
  /** Current state of the wizard */
  state: OnboardingState

  // Event handlers
  onContinue: () => void
  onBack: () => void
  onSubmitCredential: (credential: string, baseUrl?: string) => void
  onTestConnection?: (apiKey: string, baseUrl?: string) => Promise<{ success: boolean; error?: string }>
  onSkipCredentials?: () => void  // Skip API configuration
  onFinish: () => void

  className?: string
}

/**
 * OnboardingWizard - Full-screen onboarding flow container
 *
 * Manages the step-by-step flow for setting up Claude Code Desktop:
 * 1. Welcome
 * 2. Credentials (API Key + optional custom base URL)
 * 3. Completion
 */
export function OnboardingWizard({
  state,
  onContinue,
  onBack,
  onSubmitCredential,
  onTestConnection,
  onSkipCredentials,
  onFinish,
  className
}: OnboardingWizardProps) {
  const renderStep = () => {
    switch (state.step) {
      case 'welcome':
        return (
          <WelcomeStep
            isExistingUser={state.isExistingUser}
            onContinue={onContinue}
          />
        )

      case 'credentials':
        return (
          <CredentialsStep
            status={state.credentialStatus}
            errorMessage={state.errorMessage}
            onSubmit={onSubmitCredential}
            onTestConnection={onTestConnection}
            onBack={onBack}
            onSkip={onSkipCredentials}
          />
        )

      case 'complete':
        return (
          <CompletionStep
            status={state.completionStatus}
            onFinish={onFinish}
          />
        )

      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-foreground-2",
        !className?.includes('h-full') && "min-h-screen",
        className
      )}
    >
      {/* Draggable title bar region for transparent window (macOS) */}
      <div className="titlebar-drag-region fixed top-0 left-0 right-0 h-[50px] z-titlebar" />

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center p-8">
        {renderStep()}
      </main>
    </div>
  )
}
