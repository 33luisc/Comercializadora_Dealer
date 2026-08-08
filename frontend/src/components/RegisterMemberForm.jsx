// src/components/RegisterMemberForm.jsx
import React, { useState } from 'react';

function RegisterMemberForm({ formData, setFormData, afiliados = [], onRegister }) {
  const [patrocinadorEncontrado, setPatrocinadorEncontrado] = useState(null);

  // Manejador del cambio en el código del patrocinador
  const handlePatrocinadorChange = (e) => {
    const codigo = e.target.value;
    setFormData({ ...formData, id_patrocinador: codigo });

    if (!codigo.trim()) {
      setPatrocinadorEncontrado(null);
      return;
    }

    // Buscar en el estado local de afiliados
    const encontrado = afiliados.find(a => String(a.id) === codigo.trim());
    if (encontrado) {
      setPatrocinadorEncontrado(encontrado);
    } else {
      setPatrocinadorEncontrado('NOT_FOUND');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    color: '#1f2937',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const handleFocus = (e) => {
    e.target.style.backgroundColor = '#ffffff';
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
  };

  const handleBlur = (e) => {
    e.target.style.backgroundColor = '#f8fafc';
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '14px',
      padding: '20px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Encabezado Estilizado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
        <span style={{ fontSize: '18px' }}>👤</span>
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: '700', 
          color: '#0f172a',
          letterSpacing: '-0.02em'
        }}>
          Registrar Miembro
        </h3>
      </div>

      <form 
        onSubmit={onRegister} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Grid para acomodar campos limpiamente */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '14px', 
          width: '100%' 
        }}>
          
          {/* Nombre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={labelStyle}>
              Nombre <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="Ej. Camilo"
              required
              value={formData.nombre || ''} 
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Apellido */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={labelStyle}>
              Apellido <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="Ej. Benavides"
              required
              value={formData.apellido || ''} 
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} 
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Cédula */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={labelStyle}>
              Cédula <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="Ej. 1144123456"
              required
              value={formData.cedula || ''} 
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} 
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Celular */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={labelStyle}>
              Celular <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="tel" 
              placeholder="Ej. 3001234567"
              required
              value={formData.celular || ''} 
              onChange={(e) => setFormData({ ...formData, celular: e.target.value })} 
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Correo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={labelStyle}>
              Correo <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '400', textTransform: 'none' }}>(Opcional)</span>
            </label>
            <input 
              type="email" 
              placeholder="camilo@ejemplo.com"
              value={formData.correo || ''} 
              onChange={(e) => setFormData({ ...formData, correo: e.target.value })} 
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Código del Patrocinador */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={labelStyle}>
              Código del Patrocinador
            </label>
            <input 
              type="number" 
              placeholder="ID (Vacío = Líder Raíz)"
              value={formData.id_patrocinador || ''} 
              onChange={handlePatrocinadorChange} 
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

        </div>

        {/* Mensajes de Patrocinador */}
        {patrocinadorEncontrado && patrocinadorEncontrado !== 'NOT_FOUND' && (
          <div style={{ fontSize: '12px', color: '#15803d', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            ✓ Patrocinador: <strong>{patrocinadorEncontrado.nombre} {patrocinadorEncontrado.apellido}</strong> (ID: {patrocinadorEncontrado.id})
          </div>
        )}

        {patrocinadorEncontrado === 'NOT_FOUND' && (
          <div style={{ fontSize: '12px', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
            ⚠ El código ingresado no corresponde a ningún usuario existente.
          </div>
        )}

        {/* Botón Principal */}
        <button 
          type="submit" 
          style={{ 
            marginTop: '4px',
            width: '100%',
            backgroundColor: '#2563eb', 
            color: '#ffffff', 
            fontSize: '13px', 
            fontWeight: '600', 
            padding: '11px 16px', 
            borderRadius: '8px', 
            border: 'none',
            cursor: 'pointer', 
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            transition: 'all 0.15s ease',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseDown={(e) => e.target.style.transform = 'scale(0.99)'}
          onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
        >
          ➕ Agregar Afiliado
        </button>
      </form>
    </div>
  );
}

export default RegisterMemberForm;