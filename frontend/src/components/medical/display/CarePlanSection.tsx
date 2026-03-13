// REMEDIATION: Fix 3 applied
/**
 * CarePlanSection.tsx — Phases grouped with headers, steps expandable
 */

import type { CarePlanStep } from '../../../types/conditions'

const PHASE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  immediate: { label: 'Immediate Actions', icon: '🚨', color: '#ef4444' },
  daily_am: { label: 'Morning Routine', icon: '🌅', color: '#f59e0b' },
  daily_pm: { label: 'Evening Routine', icon: '🌙', color: '#6366f1' },
  weekly: { label: 'Weekly Treatments', icon: '📅', color: '#8b5cf6' },
  ongoing_management: { label: 'Ongoing Management', icon: '🔄', color: '#22c55e' },
}

interface CarePlanSectionProps {
  care_plan: CarePlanStep[]
}

export function CarePlanSection({ care_plan }: CarePlanSectionProps) {
  const grouped: Record<string, CarePlanStep[]> = {}
  for (const step of care_plan) {
    if (!grouped[step.phase]) grouped[step.phase] = []
    grouped[step.phase].push(step)
  }

  const phaseOrder = ['immediate', 'daily_am', 'daily_pm', 'weekly', 'ongoing_management']

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      padding: '1.25rem',
      marginBottom: '1rem',
    }}>
      <h3 style={{ color: '#fff', margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>
        💊 Your Care Plan
      </h3>
      {phaseOrder.map((phase) => {
        const steps = grouped[phase]
        if (!steps) return null
        const phaseInfo = PHASE_LABELS[phase] || { label: phase, icon: '📋', color: '#6366f1' }
        return (
          <div key={phase} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span>{phaseInfo.icon}</span>
              <h4 style={{ color: phaseInfo.color, margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                {phaseInfo.label}
              </h4>
            </div>
            {steps.map((step) => (
              <div key={step.step} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '0.5rem',
                borderLeft: `3px solid ${phaseInfo.color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{
                        background: `${phaseInfo.color}20`, color: phaseInfo.color,
                        borderRadius: '6px', padding: '0.1rem 0.45rem',
                        fontSize: '0.7rem', fontWeight: 700,
                      }}>
                        {step.category}
                      </span>
                      {step.is_otc_available && (
                        <span style={{ color: '#22c55e', fontSize: '0.65rem' }}>✓ OTC</span>
                      )}
                      {!step.is_otc_available && (
                        <span style={{ color: '#f59e0b', fontSize: '0.65rem' }}>℞ Prescription</span>
                      )}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', margin: '0 0 0.35rem', lineHeight: 1.5 }}>
                      {step.recommendation}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', margin: 0, lineHeight: 1.4, fontStyle: 'italic' }}>
                      💡 {step.why_explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
