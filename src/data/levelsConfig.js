export const LEVEL_REQUIREMENTS = {
  beginner: { unlocked: true },
  elementary: { requiredLevel: 'beginner', requiredCompletion: 0.75 },
  intermediate: { requiredLevel: 'elementary', requiredCompletion: 0.75 },
  advanced: { requiredLevel: 'intermediate', requiredCompletion: 0.75 },
  expert: { requiredLevel: 'advanced', requiredCompletion: 1.0 }
}
