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
    padding: '10px 14px',
    fontSize: '13px',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
  };

  return (
    <form 
      onSubmit={onRegister} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        fontFamily: 'sans-serif',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Campo: Nombre (Obligatorio) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

      {/* Campo: Apellido (Obligatorio) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

      {/* Campo: Cédula (Obligatoria y Única) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

      {/* Campo: Celular (Obligatorio) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

      {/* Campo: Correo (Opcional) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>
          Correo <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: '400' }}>(Opcional)</span>
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

      {/* Campo: Código del Patrocinador (Input en vez de Select) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>
          Código del Patrocinador
        </label>
        <input 
          type="number" 
          placeholder="Ingrese el ID (Vacío = Líder Raíz)"
          value={formData.id_patrocinador || ''} 
          onChange={handlePatrocinadorChange} 
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* Realimentación sobre el Patrocinador */}
        {patrocinadorEncontrado && patrocinadorEncontrado !== 'NOT_FOUND' && (
          <div style={{ fontSize: '12px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            ✓ Patrocinador: <strong>{patrocinadorEncontrado.nombre} {patrocinadorEncontrado.apellido}</strong> (ID: {patrocinadorEncontrado.id})
          </div>
        )}

        {patrocinadorEncontrado === 'NOT_FOUND' && (
          <div style={{ fontSize: '12px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
            ⚠ El código ingresado no corresponde a ningún usuario existente.
          </div>
        )}
      </div>

      {/* Botón de Acción Principal */}
      <button 
        type="submit" 
        style={{ 
          marginTop: '8px',
          width: '100%',
          backgroundColor: '#2563eb', 
          color: '#ffffff', 
          fontSize: '13px', 
          fontWeight: '700', 
          padding: '10px 16px', 
          borderRadius: '12px', 
          border: 'none',
          cursor: 'pointer', 
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
          transition: 'background-color 0.15s, transform 0.1s',
          boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
        onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
      >
        ➕ Agregar Afiliado
      </button>
    </form>
  );
}

export default RegisterMemberForm;