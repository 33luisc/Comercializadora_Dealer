// src/components/MembersTable.jsx
import React, { useState } from 'react';

function MembersTable({ verHistorico, datosHistoricos = [], afiliados = [], onOpenBitacora, onOpenTransaccion, onDelete }) {
  const [busqueda, setBusqueda] = useState('');

  const listaOriginal = verHistorico ? datosHistoricos : afiliados;

  // Filtrado en tiempo real por ID, Nombre, Apellido, Cédula o Celular
  const listaFiltrada = listaOriginal.filter(a => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase().trim();
    const nombreCompleto = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase();
    const cedula = String(a.cedula || '').toLowerCase();
    const celular = String(a.celular || '').toLowerCase();
    const id = String(a.id || '').toLowerCase();

    return nombreCompleto.includes(q) || cedula.includes(q) || celular.includes(q) || id.includes(q);
  });

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '16px', 
      padding: '16px', 
      overflowX: 'auto', 
      fontFamily: 'sans-serif',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Barra de Búsqueda Superior */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar por nombre, cédula, celular o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              width: '100%',
              padding: '9px 12px 9px 34px',
              fontSize: '13px',
              color: '#1f2937',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9ca3af' }}>
            🔎
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
          Mostrando <strong>{listaFiltrada.length}</strong> de <strong>{listaOriginal.length}</strong> miembros
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '850px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700' }}>ID</th>
            <th style={{ padding: '12px 10px', fontWeight: '700' }}>Nombre y Apellido</th>
            <th style={{ padding: '12px 10px', fontWeight: '700' }}>Cédula</th>
            <th style={{ padding: '12px 10px', fontWeight: '700' }}>Celular</th>
            <th style={{ padding: '12px 10px', fontWeight: '700' }}>Patrocinador</th>
            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700' }}>Estado</th>
            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700' }}>Nivel</th>
            <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700' }}>U. Acumulada</th>
            <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700' }}>Total Com.</th>
            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {listaFiltrada.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                No se encontraron miembros con el criterio de búsqueda.
              </td>
            </tr>
          ) : (
            listaFiltrada.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }}>
                {/* ID Centrado */}
                <td style={{ padding: '12px 10px', textAlign: 'center', color: '#6b7280', fontWeight: '600' }}>{a.id}</td>

                {/* Nombre completo con botón de Bitácora */}
                <td style={{ padding: '12px 10px', fontWeight: '600', color: '#111827' }}>
                  {a.nombre} {a.apellido || ''}
                  {!verHistorico && (
                    <button 
                      type="button" 
                      onClick={() => onOpenBitacora(a)} 
                      style={{ marginLeft: '6px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                      title="Ver Bitácora"
                    >
                      🔍
                    </button>
                  )}
                </td>

                {/* Cédula */}
                <td style={{ padding: '12px 10px', color: '#374151', fontFamily: 'monospace', fontSize: '12px' }}>
                  {a.cedula ? Number(a.cedula).toLocaleString('es-CO') : <span style={{ color: '#9ca3af' }}>N/A</span>}
                </td>

                {/* Celular con link a WhatsApp */}
                <td style={{ padding: '12px 10px', color: '#374151' }}>
                  {a.celular ? (
                    <a 
                      href={`https://wa.me/57${a.celular.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
                      title="Abrir WhatsApp"
                    >
                      {a.celular}
                    </a>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>N/A</span>
                  )}
                </td>

                {/* Patrocinador */}
                <td style={{ padding: '12px 10px', color: '#4b5563' }}>
                  {verHistorico ? 'N/A' : (a.nombre_patrocinador || <em style={{ color: '#9ca3af' }}>Raíz</em>)}
                </td>

                {/* Estado */}
                <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: a.estado === 'Activo' ? '#dcfce7' : '#f3f4f6',
                    color: a.estado === 'Activo' ? '#16a34a' : '#6b7280'
                  }}>
                    {a.estado}
                  </span>
                </td>

                {/* Nivel Centrado */}
                <td style={{ padding: '12px 10px', textAlign: 'center', color: '#4b5563', fontWeight: '500' }}>{a.nivel}</td>

                {/* Utilidad */}
                <td style={{ 
                  padding: '12px 10px', 
                  textAlign: 'right', 
                  fontWeight: '600',
                  color: (a.utilidad_propia || 0) >= 0 ? '#1f2937' : '#dc2626',
                  whiteSpace: 'nowrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                    <span>${Number(a.utilidad_propia || 0).toLocaleString('es-CO')}</span>
                    {!verHistorico && (
                      <button 
                        type="button" 
                        onClick={() => onOpenTransaccion(a)} 
                        style={{ 
                          cursor: 'pointer', 
                          padding: '3px 6px', 
                          fontSize: '11px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontWeight: '500',
                          color: '#374151',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
                        💸 +/-
                      </button>
                    )}
                  </div>
                </td>

                {/* Total Comisiones */}
                <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', color: '#2563eb', whiteSpace: 'nowrap' }}>
                  ${Number(Math.round(a.comision_total || 0)).toLocaleString('es-CO')}
                </td>

                {/* Acciones */}
                <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                  {!verHistorico && (
                    <button 
                      onClick={() => onDelete(a.id)} 
                      style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                      title="Eliminar Miembro"
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MembersTable;