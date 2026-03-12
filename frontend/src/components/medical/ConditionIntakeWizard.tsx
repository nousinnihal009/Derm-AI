/**
 * ConditionIntakeWizard.tsx — 3-step intake questionnaire
 *
 * Step 1: Severity + Skin Type + Age Group
 * Step 2: Affected Areas + Duration + Triggers
 * Step 3: Current Treatments + Location Consent → Submit
 */

import { useMedicalStore } from '../../store/medicalStore'
import {
  CONDITION_ICONS,
  CONDITION_DESCRIPTORS,
} from '../../constants/conditionMeta'
import type {
  ConditionKey,
  Severity,
  SkinType,
  AgeGroup,
  AffectedArea,
  SymptomDuration,
  KnownTrigger,
  CurrentTreatment,
} from '../../types/conditions'

const SEVERITY_OPTIONS: { value: Severity; label: string; color: string; desc: string }[] = [
  { value: 'mild', label: 'Mild', color: '#34d399', desc: 'Occasional, minor symptoms' },
  { value: 'moderate', label: 'Moderate', color: '#f59e0b', desc: 'Noticeable, regular symptoms' },
  { value: 'severe', label: 'Severe', color: '#ef4444', desc: 'Significant daily impact' },
]

const SKIN_TYPES: { value: SkinType; label: string }[] = [
  { value: 'oily', label: '🫧 Oily' },
  { value: 'dry', label: '🏜️ Dry' },
  { value: 'combination', label: '⚖️ Combo' },
  { value: 'sensitive', label: '🌸 Sensitive' },
  { value: 'normal', label: '✨ Normal' },
]

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 'teen', label: 'Under 20' },
  { value: 'twenties', label: '20–29' },
  { value: 'thirties', label: '30–39' },
  { value: 'forties_plus', label: '40+' },
]

const AREAS: { value: AffectedArea; label: string }[] = [
  { value: 'face', label: '😊 Face' },
  { value: 'scalp', label: '💇 Scalp' },
  { value: 'neck', label: 'Neck' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'arms', label: '💪 Arms' },
  { value: 'legs', label: '🦵 Legs' },
  { value: 'hands', label: '🤚 Hands' },
  { value: 'feet', label: '🦶 Feet' },
  { value: 'widespread', label: '🔄 Widespread' },
]

const DURATIONS: { value: SymptomDuration; label: string }[] = [
  { value: 'less_than_1_week', label: '< 1 week' },
  { value: '1_to_4_weeks', label: '1–4 weeks' },
  { value: '1_to_6_months', label: '1–6 months' },
  { value: 'more_than_6_months', label: '6+ months' },
  { value: 'chronic_recurring', label: 'Chronic / recurring' },
]

const TRIGGERS: { value: KnownTrigger; label: string }[] = [
  { value: 'stress', label: '😰 Stress' },
  { value: 'diet', label: '🍕 Diet' },
  { value: 'heat', label: '🔥 Heat' },
  { value: 'cold', label: '❄️ Cold' },
  { value: 'sun_exposure', label: '☀️ Sun' },
  { value: 'sweat', label: '💦 Sweat' },
  { value: 'specific_products', label: '🧴 Products' },
  { value: 'hormonal', label: '🔄 Hormonal' },
  { value: 'unknown', label: '❓ Unknown' },
  { value: 'none', label: '✅ None' },
]

const TREATMENTS: { value: CurrentTreatment; label: string }[] = [
  { value: 'prescription_topical', label: '💊 Rx Topical' },
  { value: 'prescription_oral', label: '💉 Rx Oral' },
  { value: 'otc_topical', label: '🧴 OTC Topical' },
  { value: 'phototherapy', label: '💡 Phototherapy' },
  { value: 'biologics', label: '🧬 Biologics' },
  { value: 'none', label: '❌ None' },
]

export function ConditionIntakeWizard() {
  const wizardStep = useMedicalStore((s) => s.wizardStep)
  const setWizardStep = useMedicalStore((s) => s.setWizardStep)
  const selectedCondition = useMedicalStore((s) => s.selectedCondition)
  const clearSelection = useMedicalStore((s) => s.clearSelection)

  // Form state
  const severity = useMedicalStore((s) => s.severity)
  const setSeverity = useMedicalStore((s) => s.setSeverity)
  const skinType = useMedicalStore((s) => s.skinType)
  const setSkinType = useMedicalStore((s) => s.setSkinType)
  const ageGroup = useMedicalStore((s) => s.ageGroup)
  const setAgeGroup = useMedicalStore((s) => s.setAgeGroup)
  const affectedAreas = useMedicalStore((s) => s.affectedAreas)
  const setAffectedAreas = useMedicalStore((s) => s.setAffectedAreas)
  const symptomDuration = useMedicalStore((s) => s.symptomDuration)
  const setSymptomDuration = useMedicalStore((s) => s.setSymptomDuration)
  const knownTriggers = useMedicalStore((s) => s.knownTriggers)
  const setKnownTriggers = useMedicalStore((s) => s.setKnownTriggers)
  const currentTreatments = useMedicalStore((s) => s.currentTreatments)
  const setCurrentTreatments = useMedicalStore((s) => s.setCurrentTreatments)
  const locationConsent = useMedicalStore((s) => s.locationConsent)
  const setLocationConsent = useMedicalStore((s) => s.setLocationConsent)
  const protocolLoading = useMedicalStore((s) => s.protocolLoading)
  const protocolError = useMedicalStore((s) => s.protocolError)
  const generateProtocol = useMedicalStore((s) => s.generateProtocol)

  if (!selectedCondition) return null
  const key = selectedCondition as ConditionKey

  const toggleArray = <T extends string>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  const canProceedStep2 = affectedAreas.length > 0
  const canSubmit = currentTreatments.length > 0

  return (
    <div>
      {/* Progress Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: '4px',
            borderRadius: '2px',
            background: wizardStep >= i
              ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
              : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Selected Condition Header */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>{CONDITION_ICONS[key]}</span>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
              {CONDITION_DESCRIPTORS[key] ? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : key}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0, fontSize: '0.78rem' }}>
              Step {wizardStep} of 3 — {wizardStep === 1 ? 'Basic Info' : wizardStep === 2 ? 'Symptoms' : 'Treatments'}
            </p>
          </div>
        </div>
        <button
          onClick={clearSelection}
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer', fontSize: '0.8rem',
          }}
        >
          ✕ Change
        </button>
      </div>

      {/* Step 1: Severity + Skin Type + Age */}
      {wizardStep === 1 && (
        <div>
          <Section title="How severe are your symptoms?">
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {SEVERITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSeverity(opt.value)}
                  style={{
                    flex: '1 1 140px',
                    background: severity === opt.value ? `${opt.color}18` : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${severity === opt.value ? opt.color : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ color: opt.color, fontWeight: 600, fontSize: '0.95rem' }}>{opt.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginTop: '0.25rem' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Your skin type">
            <ChipGroup options={SKIN_TYPES} selected={skinType} onSelect={(v) => setSkinType(v as SkinType)} />
          </Section>

          <Section title="Age group">
            <ChipGroup options={AGE_GROUPS} selected={ageGroup} onSelect={(v) => setAgeGroup(v as AgeGroup)} />
          </Section>

          <NavButtons onNext={() => setWizardStep(2)} />
        </div>
      )}

      {/* Step 2: Areas + Duration + Triggers */}
      {wizardStep === 2 && (
        <div>
          <Section title="Affected areas (select all that apply)">
            <MultiChipGroup options={AREAS} selected={affectedAreas} onToggle={(v) => toggleArray(affectedAreas, v as AffectedArea, setAffectedAreas)} />
          </Section>

          <Section title="How long have you had symptoms?">
            <ChipGroup options={DURATIONS} selected={symptomDuration} onSelect={(v) => setSymptomDuration(v as SymptomDuration)} />
          </Section>

          <Section title="Known triggers (select all that apply)">
            <MultiChipGroup options={TRIGGERS} selected={knownTriggers} onToggle={(v) => toggleArray(knownTriggers, v as KnownTrigger, setKnownTriggers)} />
          </Section>

          <NavButtons
            onBack={() => setWizardStep(1)}
            onNext={() => setWizardStep(3)}
            nextDisabled={!canProceedStep2}
          />
        </div>
      )}

      {/* Step 3: Treatments + Location + Submit */}
      {wizardStep === 3 && (
        <div>
          <Section title="Current treatments (select all that apply)">
            <MultiChipGroup options={TREATMENTS} selected={currentTreatments} onToggle={(v) => toggleArray(currentTreatments, v as CurrentTreatment, setCurrentTreatments)} />
          </Section>

          <Section title="Weather-adjusted recommendations">
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
              padding: '0.85rem 1rem', cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={locationConsent}
                onChange={(e) => setLocationConsent(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#6366f1' }}
              />
              <div>
                <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>
                  Share my location for weather-adjusted advice
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
                  Used once for temperature/humidity/UV data. Not stored.
                </div>
              </div>
            </label>
          </Section>

          {protocolError && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem',
              color: '#ef4444', fontSize: '0.85rem',
            }}>
              ⚠️ {protocolError}
            </div>
          )}

          <NavButtons
            onBack={() => setWizardStep(2)}
            submitLabel={protocolLoading ? 'Generating Protocol…' : 'Generate My Protocol'}
            onSubmit={generateProtocol}
            submitDisabled={!canSubmit || protocolLoading}
          />
        </div>
      )}
    </div>
  )
}

// ── Reusable Sub-Components ──────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function ChipGroup({ options, selected, onSelect }: {
  options: { value: string; label: string }[]
  selected: string
  onSelect: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          style={{
            background: selected === opt.value ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${selected === opt.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: selected === opt.value ? '#a5b4fc' : 'rgba(255,255,255,0.6)',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: selected === opt.value ? 600 : 400,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function MultiChipGroup({ options, selected, onToggle }: {
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const isActive = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => onToggle(opt.value)}
            style={{
              background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.6)',
              borderRadius: '8px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function NavButtons({ onBack, onNext, onSubmit, submitLabel, nextDisabled, submitDisabled }: {
  onBack?: () => void
  onNext?: () => void
  onSubmit?: () => void
  submitLabel?: string
  nextDisabled?: boolean
  submitDisabled?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '0.65rem 1.5rem',
          fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
        }}>
          ← Back
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          style={{
            background: nextDisabled ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: '#fff', borderRadius: '10px',
            padding: '0.65rem 1.5rem', fontSize: '0.85rem', fontWeight: 600,
            cursor: nextDisabled ? 'not-allowed' : 'pointer',
            opacity: nextDisabled ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          Next →
        </button>
      )}
      {onSubmit && (
        <button
          onClick={onSubmit}
          disabled={submitDisabled}
          style={{
            background: submitDisabled ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none', color: '#fff', borderRadius: '10px',
            padding: '0.65rem 1.5rem', fontSize: '0.85rem', fontWeight: 600,
            cursor: submitDisabled ? 'not-allowed' : 'pointer',
            opacity: submitDisabled ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          {submitLabel || 'Submit'}
        </button>
      )}
    </div>
  )
}
