import React, { useState } from 'react';
import { predictAging } from '../api';

const AgingPrediction: React.FC = () => {
  const [age, setAge] = useState(30);
  const [skinType, setSkinType] = useState('normal');
  const [sunExposure, setSunExposure] = useState('moderate');
  const [smoking, setSmoking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await predictAging({
        age,
        skin_type: skinType,
        sun_exposure: sunExposure,
        smoking,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    }
    setLoading(false);
  };

  const scoreColor = (score: number) => {
    if (score > 0.6) return '#ef4444';
    if (score > 0.35) return '#f59e0b';
    return '#10b981';
  };

  const levelBadge = (level: string) => {
    if (level === 'High') return 'badge-red';
    if (level === 'Moderate') return 'badge-amber';
    return 'badge-green';
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title animate-fade-in-up">🧬 Skin Aging Prediction</h1>
        <p className="page-subtitle animate-fade-in-up stagger-1">
          Get a personalized skin aging risk assessment and anti-aging plan based on your lifestyle factors.
        </p>
      </div>

      {!result ? (
        <div className="glass-card animate-fade-in-up stagger-2" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '20px', fontSize: '1.1rem' }}>
            Tell us about yourself
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: 'var(--dark-100)', fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Age
              </label>
              <input
                type="number"
                className="input-field"
                value={age}
                onChange={e => setAge(parseInt(e.target.value) || 25)}
                min={10}
                max={120}
                id="aging-age-input"
              />
            </div>

            <div>
              <label style={{ color: 'var(--dark-100)', fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Skin Type
              </label>
              <select className="select-field" value={skinType} onChange={e => setSkinType(e.target.value)} id="aging-skin-type">
                <option value="normal">Normal</option>
                <option value="dry">Dry</option>
                <option value="oily">Oily</option>
                <option value="combination">Combination</option>
                <option value="sensitive">Sensitive</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'var(--dark-100)', fontSize: '0.9rem', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                Daily Sun Exposure Level
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['low', 'moderate', 'high'].map(level => (
                  <button
                    key={level}
                    className={sunExposure === level ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setSunExposure(level)}
                    style={{ flex: 1, padding: '10px', fontSize: '0.85rem', textTransform: 'capitalize' }}
                  >
                    {level === 'low' ? '🏠' : level === 'moderate' ? '🌤️' : '☀️'} {level}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setSmoking(!smoking)}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
                  background: smoking ? '#ef4444' : 'var(--dark-500)',
                  position: 'relative', transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                  position: 'absolute', top: '3px',
                  left: smoking ? '25px' : '3px',
                  transition: 'left 0.3s',
                }} />
              </button>
              <span style={{ color: 'var(--dark-100)', fontSize: '0.9rem' }}>
                Smoker {smoking && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>(+15 years skin aging)</span>}
              </span>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handlePredict}
            disabled={loading}
            style={{ width: '100%', marginTop: '24px', padding: '14px' }}
            id="predict-aging-btn"
          >
            {loading ? (
              <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', display: 'inline-block', verticalAlign: 'middle' }} /> Analyzing...</>
            ) : '🧬 Predict Skin Aging'}
          </button>

          {error && (
            <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Overall Score */}
          <div className="glass-card animate-fade-in-up stagger-2" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 16px',
                background: `conic-gradient(${scoreColor(result.overall_score)} ${result.overall_score * 360}deg, var(--dark-600) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 30px ${scoreColor(result.overall_score)}33`,
              }}>
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%', background: 'var(--dark-800)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: scoreColor(result.overall_score) }}>
                    {Math.round(result.overall_score * 100)}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--dark-200)' }}>Risk Score</span>
                </div>
              </div>

              <span className={`badge ${result.category === 'High' ? 'badge-red' : result.category === 'Elevated' ? 'badge-amber' : result.category === 'Moderate' ? 'badge-amber' : 'badge-green'}`}
                style={{ fontSize: '0.85rem', padding: '6px 18px' }}>
                {result.category} Risk
              </span>
            </div>

            <p style={{ color: 'var(--dark-200)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
              {result.category_description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
              <div>
                <div className="stat-value" style={{ fontSize: '2rem' }}>{result.actual_age}</div>
                <p style={{ color: 'var(--dark-200)', fontSize: '0.8rem' }}>Actual Age</p>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor(result.overall_score) }}>
                  {result.predicted_skin_age}
                </div>
                <p style={{ color: 'var(--dark-200)', fontSize: '0.8rem' }}>Skin Age</p>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: result.age_offset > 5 ? '#ef4444' : result.age_offset > 2 ? '#f59e0b' : '#10b981' }}>
                  +{result.age_offset}
                </div>
                <p style={{ color: 'var(--dark-200)', fontSize: '0.8rem' }}>Years Offset</p>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className="glass-card animate-fade-in-up stagger-3" style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '1.1rem' }}>
              Risk Factor Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {result.risk_factors?.map((factor: any, i: number) => (
                <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--dark-500)', background: 'rgba(0,0,0,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{factor.icon}</span>
                      <span style={{ color: 'white', fontWeight: 600 }}>{factor.name}</span>
                    </div>
                    <span className={`badge ${levelBadge(factor.level)}`}>{factor.level}</span>
                  </div>
                  <div className="progress-bar" style={{ height: '6px', marginBottom: '8px' }}>
                    <div className="progress-fill" style={{
                      width: `${factor.score * 100}%`,
                      background: factor.level === 'High' ? '#ef4444' : factor.level === 'Moderate' ? '#f59e0b' : 'var(--gradient-primary)',
                    }} />
                  </div>
                  <p style={{ color: 'var(--dark-200)', fontSize: '0.85rem', lineHeight: 1.5 }}>{factor.description}</p>
                  <p style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', marginTop: '6px', fontWeight: 500 }}>
                    💡 {factor.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Aging Timeline */}
          <div className="glass-card animate-fade-in-up stagger-4" style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '1.1rem' }}>
              📅 Predicted Skin Health Timeline
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-500)' }}>
                    {['Age', 'Quality', 'Collagen', 'Elastin', 'UV Damage'].map(h => (
                      <th key={h} style={{ textAlign: 'center', padding: '10px', color: 'var(--dark-200)', fontWeight: 600, fontSize: '0.85rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.timeline?.map((t: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--dark-600)' }}>
                      <td style={{ textAlign: 'center', padding: '10px', color: 'white', fontWeight: 600 }}>{t.age}</td>
                      <td style={{ textAlign: 'center', padding: '10px' }}>
                        <span className={`badge ${t.predicted_quality === 'Excellent' || t.predicted_quality === 'Very Good' ? 'badge-green' : t.predicted_quality === 'Good' || t.predicted_quality === 'Fair' ? 'badge-amber' : 'badge-red'}`}>
                          {t.predicted_quality}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px', color: t.collagen_retention > 70 ? '#10b981' : t.collagen_retention > 50 ? '#f59e0b' : '#ef4444' }}>
                        {t.collagen_retention}%
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px', color: t.elastin_retention > 70 ? '#10b981' : t.elastin_retention > 50 ? '#f59e0b' : '#ef4444' }}>
                        {t.elastin_retention}%
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px', color: t.cumulative_uv_damage < 20 ? '#10b981' : t.cumulative_uv_damage < 50 ? '#f59e0b' : '#ef4444' }}>
                        {t.cumulative_uv_damage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Anti-Aging Plan */}
          <div className="glass-card animate-fade-in-up stagger-5" style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '16px', fontSize: '1.1rem' }}>
              ✨ Personalized Anti-Aging Plan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result.anti_aging_plan?.map((item: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '14px 16px', borderRadius: '12px',
                  border: '1px solid var(--dark-500)',
                  background: i === 0 ? 'rgba(99,102,241,0.08)' : 'transparent',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--gradient-primary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{item.action}</p>
                    <p style={{ color: 'var(--dark-200)', fontSize: '0.8rem', marginTop: '2px' }}>{item.impact}</p>
                  </div>
                  <span className="badge badge-purple" style={{ flexShrink: 0 }}>#{item.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Try Again */}
          <div style={{ textAlign: 'center' }}>
            <button className="btn-secondary" onClick={() => setResult(null)} style={{ marginRight: '12px' }}>
              ← Adjust Parameters
            </button>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer" style={{ marginTop: '24px' }}>
            <span>⚠️</span>
            <span>{result.disclaimer}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default AgingPrediction;
