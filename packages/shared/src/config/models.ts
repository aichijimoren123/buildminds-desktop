/**
 * Centralized model definitions for the entire application.
 * Update model IDs here when new versions are released.
 */

export interface ModelDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
}

// ============================================
// USER-SELECTABLE MODELS (shown in UI)
// ============================================

export const MODELS: ModelDefinition[] = [
  // Custom provider models (compatible with your API)
  { id: 'claude-opus-4-5', name: 'Opus 4.5', shortName: 'Opus', description: 'Most capable' },
  { id: 'claude-opus-4-5-2', name: 'Opus 4.5 v2', shortName: 'Opus v2', description: 'Most capable v2' },
  { id: 'claude-sonnet-4-5-2', name: 'Sonnet 4.5', shortName: 'Sonnet', description: 'Balanced' },
  { id: 'claude-haiku-4-5', name: 'Haiku 4.5', shortName: 'Haiku', description: 'Fast & efficient' },
  { id: 'internal-model', name: 'Internal Model', shortName: 'Internal', description: 'Internal model' },
  { id: 'internal-model-sonnet-aws', name: 'Sonnet AWS', shortName: 'Sonnet AWS', description: 'Sonnet on AWS' },
  // Official Anthropic models (keep for compatibility)
  { id: 'claude-opus-4-5-20251101', name: 'Opus 4.5 (Official)', shortName: 'Opus Official', description: 'Official Anthropic' },
  { id: 'claude-sonnet-4-5-20250929', name: 'Sonnet 4.5 (Official)', shortName: 'Sonnet Official', description: 'Official Anthropic' },
  { id: 'claude-haiku-4-5-20251001', name: 'Haiku 4.5 (Official)', shortName: 'Haiku Official', description: 'Official Anthropic' },
];

// ============================================
// PURPOSE-SPECIFIC DEFAULTS
// ============================================

/** Default model for main chat (user-facing) */
export const DEFAULT_MODEL = 'claude-sonnet-4-5-2';

/** Model for agent definition extraction (always high quality) */
export const EXTRACTION_MODEL = 'claude-opus-4-5';

/** Model for API response summarization (cost efficient) */
export const SUMMARIZATION_MODEL = 'claude-haiku-4-5';

/** Model for instruction updates (high quality for accurate document editing) */
export const INSTRUCTION_UPDATE_MODEL = 'claude-opus-4-5';

// ============================================
// HELPER FUNCTIONS
// ============================================

/** Get display name for a model ID (full name with version) */
export function getModelDisplayName(modelId: string): string {
  const model = MODELS.find(m => m.id === modelId);
  if (model) return model.name;
  // Fallback: strip prefix and date suffix
  return modelId.replace('claude-', '').replace(/-\d{8}$/, '');
}

/** Get short display name for a model ID (without version number) */
export function getModelShortName(modelId: string): string {
  const model = MODELS.find(m => m.id === modelId);
  if (model) return model.shortName;
  // Fallback: strip prefix and date suffix
  return modelId.replace('claude-', '').replace(/-[\d.-]+$/, '');
}

/** Check if model is an Opus model (for cache TTL decisions) */
export function isOpusModel(modelId: string): boolean {
  return modelId.includes('opus');
}
