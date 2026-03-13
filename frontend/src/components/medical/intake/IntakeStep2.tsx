// REMEDIATION: Fix 2 applied
/**
 * IntakeStep2.tsx — Severity, Symptom duration, and Affected areas
 */

import { useMedicalStore } from '../../../store/medicalStore'
import type { Severity, SymptomDuration, AffectedArea } from '../../../types/conditions'

const SEVERITY_OPTIONS: { value: Severity; label: string; color: string; desc: string }[] = [
  { value: 'mild', label: 'Mild', color: '#34d399', desc: 'Occasional, minor symptoms' },
  { value: 'moderate', label: 'Moderate', color: '#f59e0b', desc: 'Noticeable, regular symptoms' },
  { value: 'severe', label: 'Severe', color: '#ef4444', desc: 'Significant daily impact' },
]

const DURATIONS: { value: SymptomDuration; label: string }[] = [
  { value: 'less_than_1_week', label: '< 1 week' },
  { value: '1_to_4_weeks', label: '1–4 weeks' },
  { value: '1_to_6_months', label: '1–6 months' },
  { value: 'more_than_6_months', label: '6+ months' },
  { value: 'chronic_recurring', label: 'Chronic / recurring' },
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

export function IntakeStep2() {
  const severity = useMedicalStore((s) => s.severity)
  const setSeverity = useMedicalStore((s) => s.setSeverity)
  const symptomDuration = useMedicalStore((s) => s.symptomDuration)
  const setSymptomDuration = useMedicalStore((s) => s.setSymptomDuration)
  const affectedAreas = useMedicalStore((s) => s.affectedAreas)
  const setAffectedAreas = useMedicalStore((s) => s.setAffectedAreas)

  const toggleArray = <T extends string>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  return (
    <div>
      <Section title="How severe are your symptoms?">
        <div role="radiogroup" aria-label="Select symptom severity" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={severity === opt.value}
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

      <Section title="How long have you had symptoms?">
        <ChipGroup options={DURATIONS} selected={symptomDuration} onSelect={(v) => setSymptomDuration(v as SymptomDuration)} />
      </Section>

      <Section title="Affected areas (select all that apply)">
        <MultiChipGroup options={AREAS} selected={affectedAreas} onToggle={(v) => toggleArray(affectedAreas, v as AffectedArea, setAffectedAreas)} />
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
            role="checkbox"
            aria-checked={isActive}
            aria-label={`Affected area: ${opt.label}`}
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
