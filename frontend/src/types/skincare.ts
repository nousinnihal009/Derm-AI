// ──────────────────────────────────────────────────────────
// skincare.ts — Type contracts for the Skincare Routine Generator
// ──────────────────────────────────────────────────────────

// ── Enums / Literal Unions ──────────────────────────────

export type SkinType =
  | 'oily'
  | 'dry'
  | 'combination'
  | 'sensitive'
  | 'normal'

export type PrimaryConcern =
  | 'acne'
  | 'hyperpigmentation'
  | 'blackheads'
  | 'aging'
  | 'dullness'
  | 'large_pores'
  | 'sun_damage'
  | 'maintenance'

export type AgeGroup =
  | 'teen'
  | 'twenties'
  | 'thirties'
  | 'forties_plus'

export type SkinGoal =
  | 'glass_skin'
  | 'glowing'
  | 'brightening'
  | 'minimalist'
  | 'dermatologist'

export type SpecialSituation =
  | 'pre_makeup'
  | 'post_sun'
  | 'travel'
  | 'post_workout'
  | 'post_acne'
  | 'none'

export type MedicalCondition =
  | 'eczema'
  | 'rosacea'
  | 'psoriasis'
  | 'lichen_planus'
  | 'atopic_dermatitis'
  | 'melanoma_risk'
  | 'none'

// ── Location ────────────────────────────────────────────

export interface Location {
  lat: number
  lon: number
}

// ── Weather Context (mirrors backend WeatherContext) ─────

export interface WeatherSummary {
  temperature_c: number
  humidity_pct: number
  uv_index: number
  condition: string
  is_humid: boolean
  is_cold: boolean
}

// ── Request ─────────────────────────────────────────────

export interface RoutineRequest {
  skin_type: SkinType
  primary_concern: PrimaryConcern
  age_group: AgeGroup
  skin_goals: SkinGoal[]
  special_situation?: SpecialSituation
  location?: Location | null
  include_weekly?: boolean
  medical_condition?: MedicalCondition
  pollution_exposure?: boolean
}

// ── Response ────────────────────────────────────────────

export interface RoutineStep {
  step: number
  time_minutes: number
  category: string
  ingredient_recommendation: string
  why_explanation: string
  is_essential: boolean
  climate_adjusted: boolean
  condition_safe: boolean
}

export interface RoutineResponse {
  profile_summary: string
  weather_context: WeatherSummary | null
  am_routine: RoutineStep[]
  pm_routine: RoutineStep[]
  weekly_treatments: RoutineStep[] | null
  total_time_am: number
  total_time_pm: number
  generated_at: string
  medical_disclaimer: string | null
  condition_overrides_applied: string[]
}

// ── UI-only types (not sent to/from API) ────────────────

export interface MedicalConditionOption {
  value: MedicalCondition
  label: string
  descriptor: string
}

export const MEDICAL_CONDITION_OPTIONS: MedicalConditionOption[] = [
  { value: 'none', label: 'None / Healthy Skin', descriptor: 'No diagnosed skin conditions' },
  { value: 'eczema', label: 'Eczema', descriptor: 'Dry, itchy patches, flare-prone' },
  { value: 'rosacea', label: 'Rosacea', descriptor: 'Facial redness, visible vessels, flushing' },
  { value: 'psoriasis', label: 'Psoriasis', descriptor: 'Thick, scaly plaques' },
  { value: 'lichen_planus', label: 'Lichen Planus', descriptor: 'Purple, itchy bumps or patches' },
  { value: 'atopic_dermatitis', label: 'Atopic Dermatitis', descriptor: 'Chronic inflammation, barrier dysfunction' },
  { value: 'melanoma_risk', label: 'High Sun Sensitivity', descriptor: 'History of sun damage or elevated melanoma risk' },
]

export const SKIN_TYPE_OPTIONS: { value: SkinType; label: string }[] = [
  { value: 'oily', label: 'Oily' },
  { value: 'dry', label: 'Dry' },
  { value: 'combination', label: 'Combination' },
  { value: 'sensitive', label: 'Sensitive' },
  { value: 'normal', label: 'Normal' },
]

export const PRIMARY_CONCERN_OPTIONS: { value: PrimaryConcern; label: string }[] = [
  { value: 'acne', label: 'Acne' },
  { value: 'hyperpigmentation', label: 'Hyperpigmentation' },
  { value: 'blackheads', label: 'Blackheads' },
  { value: 'aging', label: 'Aging' },
  { value: 'dullness', label: 'Dullness' },
  { value: 'large_pores', label: 'Large Pores' },
  { value: 'sun_damage', label: 'Sun Damage' },
  { value: 'maintenance', label: 'General Maintenance' },
]

export const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'teen', label: 'Teen (13–19)' },
  { value: 'twenties', label: '20s' },
  { value: 'thirties', label: '30s' },
  { value: 'forties_plus', label: '40+' },
]

export const SKIN_GOAL_OPTIONS: { value: SkinGoal; label: string }[] = [
  { value: 'glass_skin', label: 'Glass Skin' },
  { value: 'glowing', label: 'Glowing' },
  { value: 'brightening', label: 'Brightening' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'dermatologist', label: 'Dermatologist-Grade' },
]

export const SPECIAL_SITUATION_OPTIONS: { value: SpecialSituation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'pre_makeup', label: 'Pre-Makeup' },
  { value: 'post_sun', label: 'Post-Sun Exposure' },
  { value: 'travel', label: 'Traveling' },
  { value: 'post_workout', label: 'Post-Workout' },
  { value: 'post_acne', label: 'Post-Acne Recovery' },
]
