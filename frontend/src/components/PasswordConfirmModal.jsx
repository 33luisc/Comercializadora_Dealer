// src/components/PasswordConfirmModal.jsx
import React, { useState } from 'react';
import { apiService } from '../services/api';

function PasswordConfirmModal({ pendingAfiliado, adminUser, onSuccess, onClose }) {
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verificando, setVerificando] = useState(false);

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setVerificando(true);
    setPasswordError('');

    try {
      const usernameActual = adminUser?.usuario || adminUser?.username || adminUser?.correo || 'admin';
      await apiService.verificarPassword(passwordInput, usernameActual);
      onSuccess();
    } catch (err) {
      setPasswordError(err.message || 'Contraseña incorrecta o error de conexión.');
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px',
        width: '100%', maxWidth: '360px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
          🔒 Confirmación de Seguridad
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
          Ingresa tu contraseña para editar a <strong>{`${pendingAfiliado?.nombre || ''} ${pendingAfiliado?.apellido || ''}`.trim()}</strong>.
        </p>

        <form onSubmit={handleVerifyPassword}>
          <input
            type="password"
            placeholder="Contraseña de administrador"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            autoFocus
            disabled={verificando}
            style={{
              width: '100%', padding: '10px 14px', fontSize: '13px',
              border: `1px solid ${passwordError ? '#ef4444' : '#cbd5e1'}`,
              borderRadius: '10px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px'
            }}
          />
          {passwordError && (
            <span style={{ color: '#ef4444', fontSize: '12px', display: 'block', marginBottom: '12px' }}>
              {passwordError}
            </span>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={verificando}
              style={{
                backgroundColor: '#f1f5f9', border: 'none', color: '#475569',
                padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={verificando}
              style={{
                backgroundColor: '#4f46e5', border: 'none', color: '#ffffff',
                padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                opacity: verificando ? 0.7 : 1
              }}
            >
              {verificando ? 'Verificando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordConfirmModal;