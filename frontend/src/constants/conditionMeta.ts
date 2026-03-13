// ──────────────────────────────────────────────────────────
// conditionMeta.ts — Display metadata for condition cards
// ──────────────────────────────────────────────────────────

import type { ConditionKey, ConditionCategory } from '../types/conditions'

// REMEDIATION: Fix 6 applied
/** One-line descriptors shown on condition cards in the ConditionGrid. */
export const CONDITION_DESCRIPTORS: Record<ConditionKey, string> = {
  atopic_dermatitis:                    'Chronic dry, itchy patches with recurring flare cycles',
  contact_dermatitis:                   'Rash triggered by skin contact with an irritant or allergen',
  rosacea:                              'Persistent facial redness, flushing, and visible blood vessels',
  seborrheic_dermatitis:                'Flaky, oily patches on the scalp, face, or chest',
  psoriasis:                            'Thick, scaly plaques from rapid skin cell turnover',
  lichen_planus:                        'Purple, flat-topped itchy bumps or patches on skin or mouth',
  perioral_dermatitis:                  'Small red bumps and rash around the mouth and nose',
  fungal_acne:                          'Itchy, uniform bumps caused by Malassezia yeast — not bacteria',
  ringworm:                             'Circular, scaly ring-shaped rash caused by a fungal infection',
  warts:                                'Rough, raised skin growths caused by the HPV virus',
  molluscum_contagiosum:                'Small, dome-shaped pearly bumps caused by a poxvirus',
  impetigo:                             'Contagious bacterial infection causing honey-colored crusted sores',
  cold_sores:                           'Fluid-filled blisters around the lips caused by HSV-1',
  vitiligo:                             'Loss of skin pigmentation causing white patches on the skin',
  melasma:                              'Brown or gray-brown patches from sun exposure and hormonal triggers',
  post_inflammatory_hyperpigmentation:  'Dark spots left behind after acne, injury, or inflammation heals',
  actinic_keratosis:                    'Rough, scaly patch from UV damage — requires medical evaluation',
  melanoma_risk:                        'Elevated risk of melanoma — requires dermatologist surveillance',
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
