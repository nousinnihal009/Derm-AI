// REMEDIATION: Fix 3 + Fix 8 applied
/**
 * DisclaimerFooter.tsx — Sticky disclaimer with llm_enriched note
 * Non-dismissible — no close button.
 */

interface DisclaimerFooterProps {
  medical_disclaimer: string
  llm_enriched: boolean
}

export function DisclaimerFooter({ medical_disclaimer, llm_enriched }: DisclaimerFooterProps) {
  return (
    <footer
      role="contentinfo"
      aria-label="Medical disclaimer"
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 50,
        background: 'rgba(15,15,26,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        padding: '0.75rem 1.5rem',
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: 0 }}>
        ⚕️ {medical_disclaimer}
      </p>
      {!llm_enriched && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
          Note: Personalized explanations unavailable — showing standard guidance.
        </p>
      )}
    </footer>
  )
}
