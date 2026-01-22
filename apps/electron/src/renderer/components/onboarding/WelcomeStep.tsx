import { AppSymbol } from "@/components/icons/AppSymbol"
import { StepFormLayout, ContinueButton } from "./primitives"
import { APP_NAME } from '@claude-code-desktop/shared/branding'

interface WelcomeStepProps {
  onContinue: () => void
  /** Whether this is an existing user updating settings */
  isExistingUser?: boolean
}

/**
 * WelcomeStep - Initial welcome screen for onboarding
 *
 * Shows different messaging for new vs existing users
 */
export function WelcomeStep({
  onContinue,
  isExistingUser = false
}: WelcomeStepProps) {
  return (
    <StepFormLayout
      iconElement={
        <div className="flex size-16 items-center justify-center">
          <AppSymbol className="size-10 text-accent" />
        </div>
      }
      title={isExistingUser ? 'Update Settings' : `Welcome to ${APP_NAME}`}
      description={
        isExistingUser
          ? 'Update billing or change your setup.'
          : 'Your AI assistant is ready. Connect anything, organize your sessions, and get things done!'
      }
      actions={
        <ContinueButton onClick={onContinue} className="w-full">
          {isExistingUser ? 'Continue' : 'Get Started'}
        </ContinueButton>
      }
    />
  )
}
