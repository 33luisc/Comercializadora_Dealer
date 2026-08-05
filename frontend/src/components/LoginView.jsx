import { useState } from 'react';

export default function LoginView({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.usuario));
      
      onLoginSuccess(data.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '6px',
    fontFamily: 'sans-serif'
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '65vh',
      padding: '24px 16px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #f3f4f6',
        padding: '36px 32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#eef2ff',
            color: '#4f46e5',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: '22px'
          }}>
            🔐
          </div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>
            Acceso Administrativo
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
            Ingresa tus credenciales para gestionar la configuración MLM
          </p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div style={{
            marginBottom: '20px',
            padding: '12px 14px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Usuario</label>
            <input
              type="text"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={inputStyle}
              placeholder="Ej: admin"
            />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              backgroundColor: cargando ? '#a5b4fc' : '#4f46e5',
              color: '#ffffff',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '700',
              cursor: cargando ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s ease',
              marginTop: '4px'
            }}
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}