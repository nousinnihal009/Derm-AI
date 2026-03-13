// REMEDIATION: Fix 2 applied
/**
 * IntakeStep2.tsx — Affected areas + symptom duration + known triggers
 */

import { useMedicalStore } from '../../../store/medicalStore'
import type { AffectedArea, SymptomDuration, KnownTrigger } from '../../../types/conditions'

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

export function IntakeStep2() {
  const affectedAreas = useMedicalStore((s) => s.affectedAreas)
  const setAffectedAreas = useMedicalStore((s) => s.setAffectedAreas)
  const symptomDuration = useMedicalStore((s) => s.symptomDuration)
  const setSymptomDuration = useMedicalStore((s) => s.setSymptomDuration)
  const knownTriggers = useMedicalStore((s) => s.knownTriggers)
  const setKnownTriggers = useMedicalStore((s) => s.setKnownTriggers)

  const toggleArray = <T extends string>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  return (
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
    </div>
  )
}

// ── Shared Sub-Components ────────────────────────────────

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
