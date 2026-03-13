// REMEDIATION: Fix 3 applied
/**
 * ClimateCard.tsx — Small card with climate care note
 * Rendered only when climate_care_note is non-null.
 */

interface ClimateCardProps {
  climate_care_note: string
}

export function ClimateCard({ climate_care_note }: ClimateCardProps) {
  return (
    <div style={{
      background: 'rgba(99,102,241,0.08)',
      border: '1px solid rgba(99,102,241,0.15)',
      borderRadius: '12px',
      padding: '0.85rem 1rem',
      marginBottom: '1rem',
    }}>
      <p style={{ color: '#a5b4fc', fontSize: '0.82rem', margin: 0 }}>
        🌡️ {climate_care_note}
      </p>
    </div>
  )
}
