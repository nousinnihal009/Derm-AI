// REMEDIATION: Fix 3 applied
/**
 * IngredientGuide.tsx — Two-column seek/avoid layout
 */

import type { IngredientEntry } from '../../../types/conditions'

interface IngredientGuideProps {
  ingredients_to_seek: IngredientEntry[]
  ingredients_to_avoid: IngredientEntry[]
}

export function IngredientGuide({ ingredients_to_seek, ingredients_to_avoid }: IngredientGuideProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
      <Card title="✅ Ingredients to Seek">
        {ingredients_to_seek.map((ing, i) => (
          <div key={i} style={{
            borderBottom: i < ingredients_to_seek.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            padding: '0.5rem 0',
          }}>
            <div style={{ color: '#22c55e', fontSize: '0.82rem', fontWeight: 600 }}>{ing.ingredient}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{ing.reason}</div>
          </div>
        ))}
      </Card>

      <Card title="🚫 Ingredients to Avoid">
        {ingredients_to_avoid.map((ing, i) => (
          <div key={i} style={{
            borderBottom: i < ingredients_to_avoid.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            padding: '0.5rem 0',
          }}>
            <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>{ing.ingredient}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{ing.reason}</div>
          </div>
        ))}
      </Card>
    </div>
  )
}

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
