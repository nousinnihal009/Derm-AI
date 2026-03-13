// REMEDIATION: Fix 2 applied
/**
 * IntakeStep3.tsx — Current treatments multi-select chips
 */

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

  const toggleTreatment = (val: string) => {
    const v = val as CurrentTreatment
    setCurrentTreatments(
      currentTreatments.includes(v)
        ? currentTreatments.filter((t) => t !== v)
        : [...currentTreatments, v]
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Current treatments (select all that apply)
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {TREATMENTS.map((opt) => {
            const isActive = currentTreatments.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => toggleTreatment(opt.value)}
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
      </div>
    </div>
  )
}
