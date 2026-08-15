import React, { useState, useRef } from 'react';

function RegisterMemberForm({ formData, setFormData, afiliados = [], onRegister, onReloadAfiliados }) {
  const [patrocinadorEncontrado, setPatrocinadorEncontrado] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePatrocinadorChange = (e) => {
    const codigo = e.target.value;
    setFormData({ ...formData, id_patrocinador: codigo });

    if (!codigo.trim()) {
      setPatrocinadorEncontrado(null);
      return;
    }

    const encontrado = afiliados.find(a => String(a.id) === codigo.trim());
    if (encontrado) {
      setPatrocinadorEncontrado(encontrado);
    } else {
      setPatrocinadorEncontrado('NOT_FOUND');
    }
  };

  // Manejador para enviar el archivo directo al backend
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Crear el cuerpo de la petición con el archivo
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);

    setIsUploading(true);

    try {
      const response = await fetch('http://localhost:4000/api/afiliados/importar-csv', {
        method: 'POST',
        body: bodyFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el archivo CSV.');
      }

      // Preparar mensaje de resultado con detalles si hubo errores en filas
      let mensaje = `${data.message}\nTotal insertados: ${data.insertados}`;
      if (data.errores && data.errores.length > 0) {
        mensaje += `\n\n⚠️ Errores o duplicados omitidos (${data.errores.length}):\n` + data.errores.join('\n');
      }

      alert(mensaje);

      // Si le pasaste una función para recargar el listado de afiliados en el estado global/padre
      if (onReloadAfiliados) {
        onReloadAfiliados();
      }

    } catch (err) {
      alert(`❌ Error en la importación: ${err.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Resetear el input file para permitir subir el mismo archivo si se requiere
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '7px 10px',
    fontSize: '11px',
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
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap'
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
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>👤</span>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
          Registrar Miembro
        </h3>
      </div>

      <form onSubmit={onRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Grid fluido */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '10px 12px', 
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
              maxLength={10}
              value={formData.cedula || ''} 
              onChange={(e) => {
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
              maxLength={10}
              value={formData.celular || ''} 
              onChange={(e) => {
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

          {/* Patrocinador */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={labelStyle}>
              Patrocinador
            </label>
            <input 
              type="number" 
              placeholder="ID (Vacío = Raíz)"
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

        {/* Input Oculto para Archivos CSV */}
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />

        {/* Botones de Acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
          
          <button 
            type="button" 
            disabled={isUploading}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{ 
              backgroundColor: isUploading ? '#e2e8f0' : '#f1f5f9', 
              color: isUploading ? '#94a3b8' : '#334155', 
              fontSize: '12px', 
              fontWeight: '600', 
              padding: '7px 14px', 
              borderRadius: '6px', 
              border: '1px solid #cbd5e1',
              cursor: isUploading ? 'not-allowed' : 'pointer', 
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => { if (!isUploading) e.target.style.backgroundColor = '#e2e8f0'; }}
            onMouseLeave={(e) => { if (!isUploading) e.target.style.backgroundColor = '#f1f5f9'; }}
          >
            {isUploading ? '⏳ Procesando...' : '📥 Importar CSV'}
          </button>

          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#2563eb', 
              color: '#ffffff', 
              fontSize: '12px', 
              fontWeight: '600', 
              padding: '7px 16px', 
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
          >
            ➕ Agregar Afiliado
          </button>
        </div>

      </form>
    </div>
  );
}

export default RegisterMemberForm;