// ──────────────────────────────────────────────────────────
// conditionMeta.ts — Display metadata for condition cards
// ──────────────────────────────────────────────────────────

import type { ConditionKey, ConditionCategory } from '../types/conditions'

/** One-line descriptors shown on condition cards in the ConditionGrid. */
export const CONDITION_DESCRIPTORS: Record<ConditionKey, string> = {
  atopic_dermatitis: 'Chronic dry, itchy patches with flare cycles',
  contact_dermatitis: 'Rash from skin contact with an irritant or allergen',
  rosacea: 'Facial redness, flushing, and visible blood vessels',
  seborrheic_dermatitis: 'Flaky, greasy scales on the scalp and face',
  psoriasis: 'Thick, scaly plaques with silvery-white buildup',
  lichen_planus: 'Purple, flat-topped bumps with a lacy pattern',
  perioral_dermatitis: 'Red, bumpy rash around the mouth and chin',
  fungal_acne: 'Uniform itchy bumps caused by yeast overgrowth',
  ringworm: 'Circular, red, scaly patches that expand outward',
  warts: 'Rough, raised bumps caused by HPV on skin surfaces',
  molluscum_contagiosum: 'Small, firm, dome-shaped bumps with a dimple',
  impetigo: 'Honey-colored crusted sores, highly contagious',
  cold_sores: 'Painful fluid-filled blisters on or near the lips',
  vitiligo: 'Loss of skin pigment creating white patches',
  melasma: 'Dark, symmetrical patches on sun-exposed areas',
  post_inflammatory_hyperpigmentation: 'Dark marks left behind after skin inflammation',
  actinic_keratosis: 'Rough, scaly patches from sun damage — pre-cancerous',
  melanoma_risk: 'Atypical moles or elevated risk of skin cancer',
}

/** Maps each condition key to its category for client-side filtering. */
export const CONDITION_CATEGORIES: Record<ConditionKey, ConditionCategory> = {
  atopic_dermatitis: 'inflammatory',
  contact_dermatitis: 'inflammatory',
  rosacea: 'inflammatory',
  seborrheic_dermatitis: 'inflammatory',
  psoriasis: 'inflammatory',
  lichen_planus: 'inflammatory',
  perioral_dermatitis: 'inflammatory',
  fungal_acne: 'infectious',
  ringworm: 'infectious',
  warts: 'infectious',
  molluscum_contagiosum: 'infectious',
  impetigo: 'infectious',
  cold_sores: 'infectious',
  vitiligo: 'pigmentation',
  melasma: 'pigmentation',
  post_inflammatory_hyperpigmentation: 'pigmentation',
  actinic_keratosis: 'high_risk',
  melanoma_risk: 'high_risk',
}

/** Emoji icons for each condition — used in cards and headers. */
export const CONDITION_ICONS: Record<ConditionKey, string> = {
  atopic_dermatitis: '🔴',
  contact_dermatitis: '⚡',
  rosacea: '🌹',
  seborrheic_dermatitis: '🫧',
  psoriasis: '🩹',
  lichen_planus: '💜',
  perioral_dermatitis: '👄',
  fungal_acne: '🍄',
  ringworm: '⭕',
  warts: '🫠',
  molluscum_contagiosum: '🔘',
  impetigo: '🦠',
  cold_sores: '💋',
  vitiligo: '🤍',
  melasma: '☀️',
  post_inflammatory_hyperpigmentation: '🎨',
  actinic_keratosis: '⚠️',
  melanoma_risk: '🚨',
}

/** Category D condition keys — always severe, always immediate referral. */
export const CATEGORY_D_CONDITIONS: ReadonlySet<ConditionKey> = new Set([
  'actinic_keratosis',
  'melanoma_risk',
])

/** Contagious condition keys. */
export const CONTAGIOUS_CONDITIONS: ReadonlySet<ConditionKey> = new Set([
  'ringworm',
  'warts',
  'molluscum_contagiosum',
  'impetigo',
  'cold_sores',
])

/** Human-readable category labels for the filter bar. */
export const CATEGORY_LABELS: Record<ConditionCategory, string> = {
  inflammatory: 'Inflammatory',
  infectious: 'Infectious',
  pigmentation: 'Pigmentation',
  high_risk: 'High Risk ⚠️',
}

/** Ordered list of all condition keys for deterministic rendering. */
export const ALL_CONDITION_KEYS: readonly ConditionKey[] = [
  // Category A — Inflammatory
  'atopic_dermatitis',
  'contact_dermatitis',
  'rosacea',
  'seborrheic_dermatitis',
  'psoriasis',
  'lichen_planus',
  'perioral_dermatitis',
  // Category B — Infectious
  'fungal_acne',
  'ringworm',
  'warts',
  'molluscum_contagiosum',
  'impetigo',
  'cold_sores',
  // Category C — Pigmentation & Structural
  'vitiligo',
  'melasma',
  'post_inflammatory_hyperpigmentation',
  // Category D — High Risk / Oncology-Adjacent
  'actinic_keratosis',
  'melanoma_risk',
] as const
