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
    padding: '7px 10px',
    fontSize: '12px',
    color: '#1f2937',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const handleFocus = (e) => {
    e.target.style.backgroundColor = '#ffffff';
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.15)';
  };

  const handleBlur = (e) => {
    e.target.style.backgroundColor = '#f8fafc';
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '14px 18px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Encabezado Estilizado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <span style={{ fontSize: '15px' }}>👤</span>
        <h3 style={{ 
          margin: 0, 
          fontSize: '14px', 
          fontWeight: '700', 
          color: '#0f172a',
          letterSpacing: '-0.01em'
        }}>
          Registrar Miembro
        </h3>
      </div>

      <form 
        onSubmit={onRegister} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Grid ajustado a 3 columnas simétricas */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '10px 14px', 
          width: '100%' 
        }}>
          
          {/* Nombre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>
              Cédula <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="Ej. 1144123456"
              required
              maxLength={10} // Restringe a máximo 10 caracteres
              pattern="\d{1,10}" // Solo números, entre 1 y 10 dígitos
              title="La cédula debe contener solo números y máximo 10 dígitos"
              value={formData.cedula || ''} 
              onChange={(e) => {
                // Limita la entrada a solo números y máximo 10 caracteres
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, cedula: value });
              }} 
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Celular */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>
              Celular <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input 
              type="tel" 
              placeholder="Ej. 3001234567"
              required
              minLength={10} // Requiere al menos 10 caracteres al enviar
              maxLength={10} // No permite escribir más de 10 caracteres
              pattern="\d{10}" // Exige exactamente 10 dígitos numéricos
              title="El celular debe tener exactamente 10 dígitos numéricos"
              value={formData.celular || ''} 
              onChange={(e) => {
                // Limita la entrada a solo números y máximo 10 caracteres
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, celular: value });
              }} 
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Correo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>
              Correo <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '400', textTransform: 'none' }}>(Opcional)</span>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
          <div style={{ fontSize: '11px', color: '#15803d', backgroundColor: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
            ✓ Patrocinador: <strong>{patrocinadorEncontrado.nombre} {patrocinadorEncontrado.apellido}</strong> (ID: {patrocinadorEncontrado.id})
          </div>
        )}

        {patrocinadorEncontrado === 'NOT_FOUND' && (
          <div style={{ fontSize: '11px', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '6px 10px', borderRadius: '6px', border: '1px solid #fecaca' }}>
            ⚠ El código ingresado no corresponde a ningún usuario existente.
          </div>
        )}

        {/* Botón Alineado a la Derecha */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#2563eb', 
              color: '#ffffff', 
              fontSize: '12px', 
              fontWeight: '600', 
              padding: '8px 18px', 
              borderRadius: '6px', 
              border: 'none',
              cursor: 'pointer', 
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
          >
            ➕ Agregar Afiliado
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterMemberForm;