/**
 * medicalStore.ts — Zustand store for the Medical Conditions Advisor module
 */

import { create } from 'zustand'
import type {
  ConditionKey,
  ConditionRequest,
  ConditionResponse,
  ConditionSummary,
  ConditionPreview,
  Severity,
  SkinType,
  AgeGroup,
  AffectedArea,
  SymptomDuration,
  KnownTrigger,
  CurrentTreatment,
} from '../types/conditions'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type WizardStep = 0 | 1 | 2 | 3 | 4  // 0 = grid, 1-4 = intake steps

interface MedicalStore {
  // ── Navigation ──
  wizardStep: WizardStep
  setWizardStep: (step: WizardStep) => void

  // ── Condition Selection ──
  selectedCondition: ConditionKey | null
  selectCondition: (key: ConditionKey) => void
  clearSelection: () => void

  // ── Conditions List ──
  conditions: ConditionSummary[]
  conditionsLoading: boolean
  conditionsError: string | null
  fetchConditions: () => Promise<void>

  // ── Condition Preview ──
  preview: ConditionPreview | null
  previewLoading: boolean
  fetchPreview: (key: ConditionKey) => Promise<void>

  // ── Intake Form State ──
  severity: Severity
  skinType: SkinType
  ageGroup: AgeGroup
  affectedAreas: AffectedArea[]
  symptomDuration: SymptomDuration
  knownTriggers: KnownTrigger[]
  currentTreatments: CurrentTreatment[]
  locationConsent: boolean

  setSeverity: (v: Severity) => void
  setSkinType: (v: SkinType) => void
  setAgeGroup: (v: AgeGroup) => void
  setAffectedAreas: (v: AffectedArea[]) => void
  setSymptomDuration: (v: SymptomDuration) => void
  setKnownTriggers: (v: KnownTrigger[]) => void
  setCurrentTreatments: (v: CurrentTreatment[]) => void
  setLocationConsent: (v: boolean) => void

  // ── Protocol Result ──
  lastProtocol: ConditionResponse | null
  setLastProtocol: (p: ConditionResponse | null) => void
  protocolLoading: boolean
  protocolError: string | null
  generateProtocol: () => Promise<void>
  clearProtocol: () => void

  // ── Reset ──
  resetAll: () => void
}

const initialFormState = {
  severity: 'moderate' as Severity,
  skinType: 'normal' as SkinType,
  ageGroup: 'twenties' as AgeGroup,
  affectedAreas: [] as AffectedArea[],
  symptomDuration: '1_to_4_weeks' as SymptomDuration,
  knownTriggers: [] as KnownTrigger[],
  currentTreatments: [] as CurrentTreatment[],
  locationConsent: false,
}

export const useMedicalStore = create<MedicalStore>()((set, get) => ({
  // Navigation
  wizardStep: 0,
  setWizardStep: (step) => set({ wizardStep: step }),

  // Condition selection
  selectedCondition: null,
  selectCondition: (key) => set({ selectedCondition: key, wizardStep: 1 }),
  clearSelection: () => set({ selectedCondition: null, wizardStep: 0, preview: null }),

  // Conditions list
  conditions: [],
  conditionsLoading: false,
  conditionsError: null,
  fetchConditions: async () => {
    set({ conditionsLoading: true, conditionsError: null })
    try {
      const res = await fetch(`${API_BASE}/api/medical/conditions`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      set({ conditions: data, conditionsLoading: false })
    } catch (e: any) {
      set({ conditionsError: e.message, conditionsLoading: false })
    }
  },

  // Preview
  preview: null,
  previewLoading: false,
  fetchPreview: async (key) => {
    set({ previewLoading: true })
    try {
      const res = await fetch(`${API_BASE}/api/medical/conditions/${key}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      set({ preview: data, previewLoading: false })
    } catch {
      set({ previewLoading: false })
    }
  },

  // Form state
  ...initialFormState,
  setSeverity: (v) => set({ severity: v }),
  setSkinType: (v) => set({ skinType: v }),
  setAgeGroup: (v) => set({ ageGroup: v }),
  setAffectedAreas: (v) => set({ affectedAreas: v }),
  setSymptomDuration: (v) => set({ symptomDuration: v }),
  setKnownTriggers: (v) => set({ knownTriggers: v }),
  setCurrentTreatments: (v) => set({ currentTreatments: v }),
  setLocationConsent: (v) => set({ locationConsent: v }),

  // Protocol
  lastProtocol: null,
  setLastProtocol: (p) => set({ lastProtocol: p }),
  protocolLoading: false,
  protocolError: null,
  generateProtocol: async () => {
    const s = get()
    if (!s.selectedCondition) return

    set({ protocolLoading: true, protocolError: null })

    let location: { lat: number; lon: number } | null = null
    if (s.locationConsent) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        )
        location = { lat: pos.coords.latitude, lon: pos.coords.longitude }
      } catch {
        // Proceed without location
      }
    }

    const body: ConditionRequest = {
      condition: s.selectedCondition,
      severity: s.severity,
      skin_type: s.skinType,
      age_group: s.ageGroup,
      affected_areas: s.affectedAreas,
      symptom_duration: s.symptomDuration,
      known_triggers: s.knownTriggers,
      current_treatments: s.currentTreatments,
      ...(location ? { location } : {}),
    }

    try {
      const res = await fetch(`${API_BASE}/api/medical/protocol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `HTTP ${res.status}`)
      }
      const data: ConditionResponse = await res.json()
      set({ lastProtocol: data, protocolLoading: false, wizardStep: 4 })
    } catch (e: any) {
      set({ protocolError: e.message, protocolLoading: false })
    }
  },
  clearProtocol: () => set({ lastProtocol: null, protocolError: null }),

  // Full reset
  resetAll: () => set({
    wizardStep: 0,
    selectedCondition: null,
    preview: null,
    lastProtocol: null,
    protocolLoading: false,
    protocolError: null,
    ...initialFormState,
  }),
}))
