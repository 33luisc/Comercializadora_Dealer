// src/components/NotificationToasts.jsx
import React from 'react';

export default function NotificationToasts({ errorMsg, successMsg, setErrorMsg, setSuccessMsg }) {
  // Si no hay mensajes que mostrar, no renderiza absolutamente nada
  if (!errorMsg && !successMsg) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      maxWidth: '400px',
      width: 'calc(100% - 48px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      pointerEvents: 'none'
    }}>
      {/* Mensaje de Error */}
      {errorMsg && (
        <div style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderLeft: '4px solid #ef4444',
          fontFamily: 'sans-serif'
        }}>
          <span style={{
            display: 'flex',
            height: '32px',
            width: '32px',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            backgroundColor: '#fee2e2',
            fontSize: '16px'
          }}>
            ⚠️
          </span>
          <div style={{ flex: 1, fontSize: '14px', color: '#1f2937', fontWeight: '500', lineHeight: '1.4' }}>
            {errorMsg}
          </div>
          <button 
            onClick={() => setErrorMsg('')} 
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#4b5563'}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
          >
            ×
          </button>
        </div>
      )}

      {/* Mensaje de Éxito */}
      {successMsg && (
        <div style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderLeft: '4px solid #10b981',
          fontFamily: 'sans-serif'
        }}>
          <span style={{
            display: 'flex',
            height: '32px',
            width: '32px',
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            backgroundColor: '#d1fae5',
            fontSize: '16px'
          }}>
            ✨
          </span>
          <div style={{ flex: 1, fontSize: '14px', color: '#1f2937', fontWeight: '500', lineHeight: '1.4' }}>
            {successMsg}
          </div>
          <button 
            onClick={() => setSuccessMsg('')} 
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#4b5563'}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}