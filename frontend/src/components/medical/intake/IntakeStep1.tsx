// REMEDIATION: Fix 2 applied
/**
 * IntakeStep1.tsx — Skin type selector (Condition confirmation is in wizard header)
 */

import { useMedicalStore } from '../../../store/medicalStore'
import type { SkinType } from '../../../types/conditions'

const SKIN_TYPES: { value: SkinType; label: string }[] = [
  { value: 'oily', label: '🫧 Oily' },
  { value: 'dry', label: '🏜️ Dry' },
  { value: 'combination', label: '⚖️ Combo' },
  { value: 'sensitive', label: '🌸 Sensitive' },
  { value: 'normal', label: '✨ Normal' },
]

export function IntakeStep1() {
  const skinType = useMedicalStore((s) => s.skinType)
  const setSkinType = useMedicalStore((s) => s.setSkinType)

  return (
    <div>
      <Section title="Your skin type">
        <ChipGroup options={SKIN_TYPES} selected={skinType} onSelect={(v) => setSkinType(v as SkinType)} />
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
