// src/components/ModificarAfiliado.jsx
import React, { useState, useEffect } from 'react';

export default function ModificarAfiliado({ 
  afiliado,       // Objeto del afiliado a editar
  afiliados = [], // Lista completa para el select de patrocinadores
  onClose,        // Función para cerrar el modal
  onSave          // Función callback para enviar los datos (handleUpdateAfiliado)
}) {
  // Si no hay afiliado seleccionado, no se renderiza
  if (!afiliado) return null;

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    celular: '',
    correo: '',
    id_patrocinador: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Sincronizar los datos cuando cambia el afiliado seleccionado
  useEffect(() => {
    if (afiliado) {
      setFormData({
        nombre: afiliado.nombre || '',
        apellido: afiliado.apellido || '',
        cedula: afiliado.cedula || '',
        celular: afiliado.celular || '',
        correo: afiliado.correo || '',
        id_patrocinador: afiliado.id_patrocinador !== null && afiliado.id_patrocinador !== undefined 
          ? String(afiliado.id_patrocinador) 
          : ''
      });
      setError('');
      setExito('');
    }
  }, [afiliado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExito('');

    try {
      const payload = {
        id: afiliado.id,
        ...formData,
        id_patrocinador: formData.id_patrocinador === '' ? null : Number(formData.id_patrocinador)
      };

      if (onSave) {
        await onSave(payload);
      }

      setExito('¡Afiliado actualizado correctamente!');

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      setError(err.message || 'Ocurrió un error al actualizar el afiliado.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar la lista de patrocinadores para no permitirse seleccionar a sí mismo ni generar ciclos directos
  const posiblesPatrocinadores = afiliados.filter(a => a.id !== afiliado.id);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #f1f5f9'
      }}>
        
        {/* Encabezado */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '19px', color: '#0f172a', fontWeight: '700' }}>
                Editar Afiliado
              </h3>
              <span style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                fontSize: '12px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #bfdbfe'
              }}>
                ID: #{afiliado.id}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Modifica los datos personales o cambia el patrocinador de la red.
            </p>
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Alertas */}
            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                borderLeft: '4px solid #ef4444',
                borderRadius: '6px',
                color: '#991b1b',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ⚠️ {error}
              </div>
            )}

            {exito && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f0fdf4',
                borderLeft: '4px solid #22c55e',
                borderRadius: '6px',
                color: '#166534',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                ✅ {exito}
              </div>
            )}

            {/* Fila 1: Nombre y Apellido */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Ej. Camilo"
                />
              </div>
              <div>
                <label style={labelStyle}>Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Ej. Benavides"
                />
              </div>
            </div>

            {/* Fila 2: Cédula y Celular */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Cédula / Documento *</label>
                <input
                  type="text"
                  name="cedula"
                  maxLength={10}
                  value={formData.cedula}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="Máx. 10 dígitos"
                />
              </div>
              <div>
                <label style={labelStyle}>Celular *</label>
                <input
                  type="text"
                  name="celular"
                  maxLength={10}
                  value={formData.celular}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  placeholder="10 dígitos"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label style={labelStyle}>Correo Electrónico (Opcional)</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                style={inputStyle}
                placeholder="ejemplo@correo.com"
              />
            </div>

            {/* Patrocinador (Selector Desplegable) */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginTop: '4px'
            }}>
              <label style={{ ...labelStyle, color: '#1e293b' }}>
                Patrocinador (Red)
              </label>
              <select
                name="id_patrocinador"
                value={formData.id_patrocinador}
                onChange={handleChange}
                style={{ ...inputStyle, backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                <option value="">-- Sin Patrocinador (Cabeza de Red / Raíz) --</option>
                {posiblesPatrocinadores.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.nombre} {p.apellido || ''} (Cupos libres: {p.cupos_libres ?? 15})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                💡 Si cambias este patrocinador, el afiliado y toda su red dependiente se moverán dinámicamente debajo de la nueva posición.
              </span>
            </div>

          </div>

          {/* Pie del Modal con Acciones */}
          <div style={{
            padding: '16px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            alignItems: 'center'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: loading ? '#94a3b8' : '#2563eb',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// Estilos Reutilizables
const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#475569',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};