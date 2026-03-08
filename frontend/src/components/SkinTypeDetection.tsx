import React, { useState, useRef } from 'react';
import { detectSkinType } from '../api';

const SkinTypeDetection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
    setResult(null);
  };

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await detectSkinType(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Detection failed');
    }
    setLoading(false);
  };

  const typeColors: Record<string, string> = {
    oily: '#06b6d4',
    dry: '#f59e0b',
    combination: '#8b5cf6',
    normal: '#10b981',
    sensitive: '#f43f5e',
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title animate-fade-in-up">🔍 AI Skin Type Detection</h1>
        <p className="page-subtitle animate-fade-in-up stagger-1">
          Upload a close-up photo of your skin and our AI will analyze your skin type with personalized care tips.
        </p>
      </div>

      {/* Upload */}
      {!result && (
        <div className="glass-card animate-fade-in-up stagger-2" style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
          <div
            className={`upload-zone ${file ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="skin-type-upload"
            />
            {preview ? (
              <div>
                <img src={preview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '12px', margin: '0 auto 12px', display: 'block' }} />
                <p style={{ color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.9rem' }}>{file?.name}</p>
                <p style={{ color: 'var(--dark-300)', fontSize: '0.8rem', marginTop: '4px' }}>Click to change</p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
                <p style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>Upload a close-up skin photo</p>
                <p style={{ color: 'var(--dark-300)', fontSize: '0.85rem' }}>Face, forehead, or cheek area works best</p>
              </div>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={handleDetect}
            disabled={!file || loading}
            style={{ width: '100%', marginTop: '16px', padding: '14px' }}
            id="detect-skin-type-btn"
          >
            {loading ? (
              <><div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', display: 'inline-block', verticalAlign: 'middle' }} /> Analyzing...</>
            ) : '🔍 Detect Skin Type'}
          </button>

          {error && (
            <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Main Result */}
          <div className="glass-card animate-fade-in-up stagger-2" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{result.info?.icon}</div>
            <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
              {result.info?.type} Skin
            </h2>
            <p style={{ color: 'var(--dark-200)', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.6 }}>
              {result.info?.description}
            </p>
            <span className="badge badge-purple" style={{ fontSize: '0.85rem', padding: '6px 18px' }}>
              {Math.round(result.confidence * 100)}% Confidence
            </span>

            {/* Probability bars */}
            <div style={{ maxWidth: '400px', margin: '24px auto 0' }}>
              {Object.entries(result.probabilities || {})
                .sort(([, a]: any, [, b]: any) => b - a)
                .map(([type, prob]: any) => (
                  <div key={type} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--dark-100)', fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: type === result.detected_type ? 600 : 400 }}>
                        {type}
                      </span>
                      <span style={{ color: 'var(--dark-200)', fontSize: '0.8rem' }}>
                        {Math.round(prob * 100)}%
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div className="progress-fill" style={{
                        width: `${prob * 100}%`,
                        background: type === result.detected_type ? `${typeColors[type] || 'var(--primary-500)'}` : 'var(--dark-400)',
                      }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Characteristics & Care Tips */}
          <div className="grid-2 animate-fade-in-up stagger-3" style={{ marginBottom: '24px' }}>
            <div className="glass-card">
              <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '14px', fontSize: '1.05rem' }}>
                📋 Skin Characteristics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.info?.characteristics?.map((c: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: typeColors[result.detected_type] || 'var(--primary-400)', marginTop: '2px' }}>•</span>
                    <span style={{ color: 'var(--dark-200)', fontSize: '0.9rem', lineHeight: 1.5 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '14px', fontSize: '1.05rem' }}>
                💡 Care Tips
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.info?.care_tips?.map((tip: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: 'var(--accent-emerald)', marginTop: '2px' }}>✓</span>
                    <span style={{ color: 'var(--dark-200)', fontSize: '0.9rem', lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="grid-2 animate-fade-in-up stagger-4" style={{ marginBottom: '24px' }}>
            <div className="glass-card">
              <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '14px', fontSize: '1.05rem' }}>
                ✅ Recommended Ingredients
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.info?.recommended_ingredients?.map((ing: string, i: number) => (
                  <span key={i} className="badge badge-green" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '14px', fontSize: '1.05rem' }}>
                ❌ Ingredients to Avoid
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {result.info?.avoid_ingredients?.map((ing: string, i: number) => (
                  <span key={i} className="badge badge-red" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Try Again */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <button className="btn-secondary" onClick={() => { setResult(null); setFile(null); setPreview(null); }}>
              ← Analyze Another Image
            </button>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <span>⚠️</span>
            <span>{result.disclaimer}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default SkinTypeDetection;
