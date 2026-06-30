// src/components/RegisterMemberForm.jsx
import React from 'react';

function RegisterMemberForm({ formData, setFormData, afiliados, onRegister }) {
  // Filtrar para que solo los miembros activos (o que no sean el usuario actual si estuvieras editando) puedan ser patrocinadores
  const patrocinadoresDisponibles = afiliados.filter(a => a.estado === 'Activo');

  return (
    <form 
      onSubmit={onRegister} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        fontFamily: 'sans-serif',
        width: '100%', // 👈 Clave para que se adapte perfectamente al Grid de App.jsx
        boxSizing: 'border-box'
      }}
    >
      {/* Campo: Nombre Completo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', tracking: '0.05em' }}>
          Nombre
        </label>
        <input 
          type="text" 
          placeholder="Ej. Camilo Benavides"
          required
          value={formData.nombre} 
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} 
          style={{ 
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
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
          }}
        />
      </div>

      {/* Campo: Patrocinador Directo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', tracking: '0.05em' }}>
          Patrocinador
        </label>
        <select 
          value={formData.id_patrocinador} 
          onChange={(e) => setFormData({ ...formData, id_patrocinador: e.target.value })} 
          style={{ 
            width: '100%',
            padding: '10px 14px', 
            fontSize: '13px',
            color: '#1f2937',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Ninguno (Es Líder Raíz)</option>
          {patrocinadoresDisponibles.map((a) => (
            <option key={a.id} value={a.id}>
              ID {a.id} - {a.nombre}
            </option>
          ))}
        </select>
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