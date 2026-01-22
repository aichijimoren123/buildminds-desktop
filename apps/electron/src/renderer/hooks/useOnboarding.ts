/**
 * useOnboarding Hook
 *
 * Manages the state machine for the onboarding wizard.
 * Simplified billing-only flow:
 * 1. Welcome
 * 2. Credentials (API Key + optional custom base URL)
 * 3. Complete
 */
import { useState, useCallback } from 'react'
import type {
  OnboardingState,
  OnboardingStep,
  CredentialStatus,
} from '@/components/onboarding'
import type { SetupNeeds } from '../../shared/types'

interface UseOnboardingOptions {
  /** Called when onboarding is complete */
  onComplete: () => void
  /** Initial setup needs from auth state check */
  initialSetupNeeds?: SetupNeeds
}

interface UseOnboardingReturn {
  // State
  state: OnboardingState

  // Wizard actions
  handleContinue: () => void
  handleBack: () => void

  // Credentials
  handleSubmitCredential: (credential: string, baseUrl?: string) => void
  handleTestConnection: (apiKey: string, baseUrl?: string) => Promise<{ success: boolean; error?: string }>
  handleSkipCredentials: () => void  // Skip API configuration

  // Completion
  handleFinish: () => void
  handleCancel: () => void

  // Reset
  reset: () => void
}

export function useOnboarding({
  onComplete,
  initialSetupNeeds,
}: UseOnboardingOptions): UseOnboardingReturn {
  // Main wizard state
  const [state, setState] = useState<OnboardingState>({
    step: 'welcome',
    loginStatus: 'idle',
    credentialStatus: 'idle',
    completionStatus: 'saving',
    isExistingUser: initialSetupNeeds?.needsBillingConfig ?? false,
  })

  // Save configuration
  const handleSaveConfig = useCallback(async (credential?: string, baseUrl?: string) => {
    setState(s => ({ ...s, completionStatus: 'saving' }))

    try {
      console.log('[Onboarding] Saving config with authType: api_key, baseUrl:', baseUrl)

      const result = await window.electronAPI.saveOnboardingConfig({
        authType: 'api_key',
        credential,
        apiBaseUrl: baseUrl,
      })

      if (result.success) {
        console.log('[Onboarding] Save successful')
        setState(s => ({ ...s, completionStatus: 'complete' }))
      } else {
        console.error('[Onboarding] Save failed:', result.error)
        setState(s => ({
          ...s,
          completionStatus: 'saving',
          errorMessage: result.error || 'Failed to save configuration',
        }))
      }
    } catch (error) {
      console.error('[Onboarding] handleSaveConfig error:', error)
      setState(s => ({
        ...s,
        errorMessage: error instanceof Error ? error.message : 'Failed to save configuration',
      }))
    }
  }, [])

  // Continue to next step
  const handleContinue = useCallback(async () => {
    switch (state.step) {
      case 'welcome':
        setState(s => ({ ...s, step: 'credentials' }))
        break

      case 'credentials':
        // Handled by handleSubmitCredential
        break

      case 'complete':
        onComplete()
        break
    }
  }, [state.step, onComplete])

  // Go back to previous step
  const handleBack = useCallback(() => {
    switch (state.step) {
      case 'credentials':
        setState(s => ({ ...s, step: 'welcome', credentialStatus: 'idle', errorMessage: undefined }))
        break
    }
  }, [state.step])

  // Submit credential (API key)
  const handleSubmitCredential = useCallback(async (credential: string, baseUrl?: string) => {
    setState(s => ({ ...s, credentialStatus: 'validating', errorMessage: undefined }))

    try {
      if (!credential.trim()) {
        setState(s => ({
          ...s,
          credentialStatus: 'error',
          errorMessage: 'Please enter a valid API key',
        }))
        return
      }

      await handleSaveConfig(credential, baseUrl)

      setState(s => ({
        ...s,
        credentialStatus: 'success',
        step: 'complete',
      }))
    } catch (error) {
      setState(s => ({
        ...s,
        credentialStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Validation failed',
      }))
    }
  }, [handleSaveConfig])

  // Test API connection
  const handleTestConnection = useCallback(async (apiKey: string, baseUrl?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await window.electronAPI.testApiConnection(apiKey, baseUrl)
      return result
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      }
    }
  }, [])

  // Skip API configuration - go directly to completion
  const handleSkipCredentials = useCallback(async () => {
    console.log('[Onboarding] Skipping API configuration')

    // Save minimal config without credentials
    try {
      const result = await window.electronAPI.saveOnboardingConfig({
        // No authType, no credential - user will configure later
      })

      if (result.success) {
        setState(s => ({
          ...s,
          step: 'complete',
          completionStatus: 'complete',
        }))
      } else {
        setState(s => ({
          ...s,
          errorMessage: result.error || 'Failed to save configuration',
        }))
      }
    } catch (error) {
      console.error('[Onboarding] Skip error:', error)
      // Still proceed to completion even on error
      setState(s => ({
        ...s,
        step: 'complete',
        completionStatus: 'complete',
      }))
    }
  }, [])

  // Finish onboarding
  const handleFinish = useCallback(() => {
    onComplete()
  }, [onComplete])

  // Cancel onboarding
  const handleCancel = useCallback(() => {
    setState(s => ({ ...s, step: 'welcome' }))
  }, [])

  // Reset onboarding to initial state (used after logout)
  const reset = useCallback(() => {
    setState({
      step: 'welcome',
      loginStatus: 'idle',
      credentialStatus: 'idle',
      completionStatus: 'saving',
      isExistingUser: false,
      errorMessage: undefined,
    })
  }, [])

  return {
    state,
    handleContinue,
    handleBack,
    handleSubmitCredential,
    handleTestConnection,
    handleSkipCredentials,
    handleFinish,
    handleCancel,
    reset,
  }
}
