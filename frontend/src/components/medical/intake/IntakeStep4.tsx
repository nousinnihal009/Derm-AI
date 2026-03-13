// REMEDIATION: Fix 1 applied
/**
 * IntakeStep4.tsx — Age group selection + location toggle
 * Final wizard step before protocol generation.
 */

import { useMedicalStore } from '../../../store/medicalStore'
import { useLocation } from '../../../hooks/useLocation'
import type { AgeGroup } from '../../../types/conditions'

const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string; sub: string }[] = [
  { value: 'teen',         label: 'Teen',  sub: 'Under 18' },
  { value: 'twenties',     label: '20s',   sub: '18–29' },
  { value: 'thirties',     label: '30s',   sub: '30–39' },
  { value: 'forties_plus', label: '40+',   sub: '40 and over' },
]

export function IntakeStep4() {
  const ageGroup = useMedicalStore((s) => s.ageGroup)
  const setAgeGroup = useMedicalStore((s) => s.setAgeGroup)
  const locationConsent = useMedicalStore((s) => s.locationConsent)
  const setLocationConsent = useMedicalStore((s) => s.setLocationConsent)

  const { state: locState, request: requestLocation } = useLocation()

  const handleToggleLocation = () => {
    if (locState.status === 'idle') {
      setLocationConsent(true)
      requestLocation()
    } else if (locState.status === 'resolved') {
      setLocationConsent(!locationConsent)
    }
  }

  return (
    <div>
      {/* Age Group */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Your age group
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {AGE_GROUP_OPTIONS.map((opt) => {
            const isSelected = ageGroup === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setAgeGroup(opt.value)}
                style={{
                  flex: '1 1 100px',
                  background: isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: isSelected ? '#a5b4fc' : 'rgba(255,255,255,0.6)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                <div style={{ fontSize: '0.9rem' }}>{opt.label}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.15rem' }}>{opt.sub}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Location Toggle */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Climate-aware recommendations
        </h3>
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
          }}
        >
          {/* Toggle row */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: locState.status === 'loading' ? 'wait' : 'pointer' }}>
            {locState.status === 'loading' ? (
              <div style={{
                width: '18px', height: '18px',
                border: '2px solid rgba(255,255,255,0.15)',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                flexShrink: 0,
              }} />
            ) : (
              <input
                type="checkbox"
                checked={locationConsent && locState.status === 'resolved'}
                onChange={handleToggleLocation}
                disabled={false}
                style={{ width: '18px', height: '18px', accentColor: '#6366f1', flexShrink: 0 }}
              />
            )}
            <div>
              <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>
                Use my location for climate-aware advice
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
                Adjusts your protocol for local weather conditions
              </div>
            </div>
          </label>

          {/* State-specific feedback */}
          {locState.status === 'resolved' && (
            <div style={{ marginTop: '0.5rem', color: '#22c55e', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              ✓ Location detected
            </div>
          )}
          {locState.status === 'denied' && (
            <div style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
              Location unavailable — proceeding without climate data
            </div>
          )}
          {locState.status === 'unavailable' && (
            <div style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
              Location unavailable — proceeding without climate data
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
