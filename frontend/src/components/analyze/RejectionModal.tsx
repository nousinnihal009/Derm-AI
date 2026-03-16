import React from 'react';

interface RejectionModalProps {
  reason: string;
  userMessage: string;
  onRetry: () => void;
  onDismiss: () => void;
}

const REJECTION_ICONS: Record<string, string> = {
  no_skin_detected:    '🔍',
  image_too_blurry:    '📷',
  image_too_dark:      '🌑',
  image_too_small:     '🔎',
  corrupt_or_invalid:  '⚠️',
  screenshot_detected: '🖥️',
};

const REJECTION_TIPS: Record<string, string> = {
  no_skin_detected:    'Point the camera directly at the affected skin area. Make sure at least 30% of the photo shows skin.',
  image_too_blurry:    'Hold your device still and tap the screen to focus before taking the photo.',
  image_too_dark:      'Move to a window or turn on a lamp. Avoid flash as it can wash out details.',
  image_too_small:     'Use your device camera app rather than a screenshot. Hold the camera closer to the area.',
  corrupt_or_invalid:  'Try saving the image as a JPG and re-uploading.',
  screenshot_detected: 'Use your camera to take a direct photo of your skin. Screenshots of photos will not work.',
};

const RejectionModal: React.FC<RejectionModalProps> = ({ reason, userMessage, onRetry, onDismiss }) => {
  const icon = REJECTION_ICONS[reason] || '⚠️';
  const tip = REJECTION_TIPS[reason] || 'Please try uploading a different photo.';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Image Rejection"
      id="rejection-modal-overlay"
    >
      <div
        style={{
          background: '#1A1A2E',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '40px 32px 32px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          maxWidth: '460px',
          width: '90%',
          textAlign: 'center',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
        id="rejection-modal-content"
      >
        {/* Icon */}
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{icon}</div>

        {/* Title */}
        <h3 style={{
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 700,
          marginBottom: '12px',
          lineHeight: 1.3,
        }}>
          Photo Quality Issue
        </h3>

        {/* Message */}
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          marginBottom: '20px',
        }}>
          {userMessage}
        </p>

        {/* Tip */}
        <div style={{
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '28px',
          textAlign: 'left',
        }}>
          <p style={{
            color: 'rgba(99,102,241,0.9)',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            💡 Tip
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            {tip}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-primary"
            onClick={onRetry}
            style={{ flex: 1, padding: '12px' }}
            id="rejection-retry-btn"
          >
            📷 Retake Photo
          </button>
          <button
            className="btn-secondary"
            onClick={onDismiss}
            style={{ flex: 1, padding: '12px' }}
            id="rejection-dismiss-btn"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;
