// REMEDIATION: Fix 2 applied
/**
 * IntakeStep3.tsx — Current treatments and Known triggers
 */

import { useState } from 'react'
import { useMedicalStore } from '../../../store/medicalStore'
import type { CurrentTreatment } from '../../../types/conditions'

const TREATMENTS: { value: CurrentTreatment; label: string }[] = [
  { value: 'prescription_topical', label: '💊 Rx Topical' },
  { value: 'prescription_oral', label: '💉 Rx Oral' },
  { value: 'otc_topical', label: '🧴 OTC Topical' },
  { value: 'phototherapy', label: '💡 Phototherapy' },
  { value: 'biologics', label: '🧬 Biologics' },
  { value: 'none', label: '❌ None' },
]

export function IntakeStep3() {
  const currentTreatments = useMedicalStore((s) => s.currentTreatments)
  const setCurrentTreatments = useMedicalStore((s) => s.setCurrentTreatments)
  const knownTriggers = useMedicalStore((s) => s.knownTriggers)
  const setKnownTriggers = useMedicalStore((s) => s.setKnownTriggers)

  const [tagInput, setTagInput] = useState('')

  const toggleArray = <T extends string>(arr: T[], val: T, setter: (v: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim()
      if (val && !knownTriggers.includes(val as any)) {
        setKnownTriggers([...knownTriggers, val as any])
      }
      setTagInput('')
    }
  }

  const removeTrigger = (trigger: string) => {
    setKnownTriggers(knownTriggers.filter((t) => t !== trigger))
  }

  return (
    <div>
      <Section title="Current treatments (select all that apply)">
        <MultiChipGroup options={TREATMENTS} selected={currentTreatments} onToggle={(v) => toggleArray(currentTreatments, v as CurrentTreatment, setCurrentTreatments)} />
      </Section>

      <Section title="Known triggers (type and press Enter)">
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '0.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
        }}>
          {knownTriggers.map((t) => (
            <span
              key={t}
              style={{
                background: 'rgba(99,102,241,0.2)',
                color: '#a5b4fc',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              {t}
              <button
                onClick={() => removeTrigger(t)}
                aria-label={`Remove trigger: ${t}`}
                style={{
                  background: 'none', border: 'none', color: '#a5b4fc',
                  cursor: 'pointer', padding: 0, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={knownTriggers.length === 0 ? "e.g. stress, dairy, sun..." : ""}
            aria-label="Add a known trigger — press Enter or comma to confirm"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              outline: 'none',
              flex: 1,
              minWidth: '120px',
              fontSize: '0.85rem',
            }}
          />
        </div>
      </Section>
    </div>
  )
}

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
