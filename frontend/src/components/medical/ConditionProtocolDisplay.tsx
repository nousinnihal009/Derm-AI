/**
 * ConditionProtocolDisplay.tsx — Displays the generated care protocol
 *
 * Sections:
 *  - Referral Banner (if referral recommended)
 *  - Education Card
 *  - Care Plan Steps (grouped by phase)
 *  - Ingredients (seek / avoid)
 *  - Trigger Management
 *  - Red Flags
 *  - Weather Context
 *  - Disclaimer
 */

import { useMedicalStore } from '../../store/medicalStore'

const PHASE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  immediate: { label: 'Immediate Actions', icon: '🚨', color: '#ef4444' },
  daily_am: { label: 'Morning Routine', icon: '🌅', color: '#f59e0b' },
  daily_pm: { label: 'Evening Routine', icon: '🌙', color: '#6366f1' },
  weekly: { label: 'Weekly Treatments', icon: '📅', color: '#8b5cf6' },
  ongoing_management: { label: 'Ongoing Management', icon: '🔄', color: '#22c55e' },
}

const URGENCY_COLORS: Record<string, string> = {
  immediate: '#ef4444',
  soon: '#f59e0b',
  routine: '#6366f1',
  not_required: '#22c55e',
}

export function ConditionProtocolDisplay() {
  const protocol = useMedicalStore((s) => s.protocol)
  const resetAll = useMedicalStore((s) => s.resetAll)

  if (!protocol) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.5)' }}>
        <p>No protocol generated yet.</p>
      </div>
    )
  }

  // Group care plan by phase
  const grouped: Record<string, typeof protocol.care_plan> = {}
  for (const step of protocol.care_plan) {
    if (!grouped[step.phase]) grouped[step.phase] = []
    grouped[step.phase].push(step)
  }

  const phaseOrder = ['immediate', 'daily_am', 'daily_pm', 'weekly', 'ongoing_management']

  return (
    <div>
      {/* Referral Banner */}
      {protocol.referral_recommended && (
        <div style={{
          background: `linear-gradient(135deg, ${URGENCY_COLORS[protocol.referral_urgency]}18, ${URGENCY_COLORS[protocol.referral_urgency]}08)`,
          border: `1px solid ${URGENCY_COLORS[protocol.referral_urgency]}40`,
          borderRadius: '14px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.3rem' }}>
              {protocol.referral_urgency === 'immediate' ? '🚨' : protocol.referral_urgency === 'soon' ? '⚡' : '📋'}
            </span>
            <h3 style={{
              color: URGENCY_COLORS[protocol.referral_urgency],
              margin: 0, fontSize: '1rem', fontWeight: 700,
            }}>
              {protocol.referral_urgency === 'immediate' ? 'Immediate Dermatologist Visit Recommended'
                : protocol.referral_urgency === 'soon' ? 'See a Dermatologist Soon'
                : 'Dermatologist Visit Recommended'}
            </h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
            {protocol.when_to_see_doctor}
          </p>
        </div>
      )}

      {/* Severity Badge + Title */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
            {protocol.condition_display_name}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <Badge label={`Severity: ${protocol.severity_assessed}`}
              color={protocol.severity_assessed === 'severe' ? '#ef4444' : protocol.severity_assessed === 'moderate' ? '#f59e0b' : '#22c55e'} />
            <Badge label={protocol.category.replace('_', ' ')} color="#6366f1" />
            {protocol.is_contagious && <Badge label="Contagious" color="#f59e0b" />}
            {protocol.llm_enriched && <Badge label="AI-Enhanced" color="#8b5cf6" />}
          </div>
        </div>
      </div>

      {/* Education Card */}
      <Card title="📚 Understanding Your Condition">
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
            What is it?
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            {protocol.education.what_it_is}
          </p>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
            What causes it?
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            {protocol.education.what_causes_it}
          </p>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
            Duration
          </h4>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: 0 }}>
            {protocol.education.typical_duration}
          </p>
        </div>
        {protocol.education.contagion_guidance && (
          <div style={{
            background: 'rgba(245,158,11,0.1)', borderRadius: '8px', padding: '0.75rem',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <p style={{ color: '#f59e0b', fontSize: '0.82rem', margin: 0, fontWeight: 600 }}>
              ⚡ Contagion Guidance
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
              {protocol.education.contagion_guidance}
            </p>
          </div>
        )}
        {protocol.education.common_misconceptions.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
              Common Myths
            </h4>
            {protocol.education.common_misconceptions.map((m, i) => (
              <p key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: '0.35rem 0', lineHeight: 1.4 }}>
                {m}
              </p>
            ))}
          </div>
        )}
      </Card>

      {/* Care Plan */}
      <Card title="💊 Your Care Plan">
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
      </Card>

      {/* Ingredients */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <Card title="✅ Ingredients to Seek">
          {protocol.ingredients_to_seek.map((ing, i) => (
            <div key={i} style={{
              borderBottom: i < protocol.ingredients_to_seek.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              padding: '0.5rem 0',
            }}>
              <div style={{ color: '#22c55e', fontSize: '0.82rem', fontWeight: 600 }}>{ing.ingredient}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{ing.reason}</div>
            </div>
          ))}
        </Card>

        <Card title="🚫 Ingredients to Avoid">
          {protocol.ingredients_to_avoid.map((ing, i) => (
            <div key={i} style={{
              borderBottom: i < protocol.ingredients_to_avoid.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              padding: '0.5rem 0',
            }}>
              <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>{ing.ingredient}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{ing.reason}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Triggers */}
      <Card title="🎯 Trigger Management">
        {protocol.trigger_guidance.map((t, i) => (
          <div key={i} style={{
            display: 'flex', gap: '0.75rem', padding: '0.6rem 0',
            borderBottom: i < protocol.trigger_guidance.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <Badge
              label={t.severity_impact}
              color={t.severity_impact === 'severe' ? '#ef4444' : t.severity_impact === 'moderate' ? '#f59e0b' : '#22c55e'}
            />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 600 }}>{t.trigger}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>{t.management_tip}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* Red Flags */}
      <Card title="🚩 Red Flags — When to Seek Help">
        {protocol.red_flags.map((rf, i) => (
          <div key={i} style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '0.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{
                background: 'rgba(239,68,68,0.2)', color: '#ef4444',
                borderRadius: '6px', padding: '0.1rem 0.5rem',
                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
              }}>
                {rf.urgency.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 600 }}>
              {rf.description}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', marginTop: '0.2rem' }}>
              {rf.action}
            </div>
          </div>
        ))}
      </Card>

      {/* Weather */}
      {protocol.weather_context && (
        <Card title="🌤️ Weather-Adjusted Advice">
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <WeatherStat label="Temp" value={`${protocol.weather_context.temperature_c.toFixed(1)}°C`} />
            <WeatherStat label="Humidity" value={`${protocol.weather_context.humidity_pct.toFixed(0)}%`} />
            <WeatherStat label="UV Index" value={protocol.weather_context.uv_index.toFixed(1)} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', margin: 0 }}>
            {protocol.weather_context.routine_impact}
          </p>
          {protocol.climate_care_note && (
            <div style={{
              marginTop: '0.75rem', background: 'rgba(99,102,241,0.1)',
              borderRadius: '8px', padding: '0.65rem 0.85rem',
            }}>
              <p style={{ color: '#a5b4fc', fontSize: '0.82rem', margin: 0 }}>
                🌍 {protocol.climate_care_note}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Prescription Note */}
      {protocol.prescription_interaction_note && (
        <Card title="💊 Prescription Notes">
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>
            {protocol.prescription_interaction_note}
          </p>
        </Card>
      )}

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(255,179,71,0.06)',
        border: '1px solid rgba(255,179,71,0.15)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginTop: '1.5rem',
      }}>
        <p style={{ color: 'rgba(255,179,71,0.8)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
          ⚠️ {protocol.medical_disclaimer}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          onClick={resetAll}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: '#fff', borderRadius: '10px',
            padding: '0.75rem 2rem', fontSize: '0.9rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          ← View Another Condition
        </button>
      </div>
    </div>
  )
}

// ── Sub-Components ───────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      padding: '1.25rem',
      marginBottom: '1rem',
    }}>
      <h3 style={{ color: '#fff', margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      background: `${color}20`,
      color,
      padding: '0.15rem 0.55rem',
      borderRadius: '6px',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function WeatherStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
        {value}
      </div>
    </div>
  )
}
