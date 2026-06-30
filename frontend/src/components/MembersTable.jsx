// src/components/MembersTable.jsx
import React from 'react';

function MembersTable({ verHistorico, datosHistoricos, afiliados, onOpenBitacora, onOpenTransaccion, onDelete }) {
  const listaA_Mostrar = verHistorico ? datosHistoricos : afiliados;

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '16px', 
      padding: '16px', 
      overflowX: 'auto', 
      fontFamily: 'sans-serif',
      width: '100%' // Forzar a ocupar el espacio del grid asignado
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '600px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', color: '#4b5563', borderBottom: '1px solid #e5e7eb' }}>
            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700' }}>ID</th>
            <th style={{ padding: '12px 10px', fontWeight: '700' }}>Nombre</th>
            <th style={{ padding: '12px 10px', fontWeight: '700' }}>Patrocinador</th>
            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700' }}>Estado</th>
            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700' }}>Nivel</th>
            <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700' }}>U. Acumulada</th>
            <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700' }}>Total Com.</th>
            <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {listaA_Mostrar.map(a => (
            <tr key={a.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }}>
              {/* ID Centrado */}
              <td style={{ padding: '12px 10px', textAlign: 'center', color: '#6b7280' }}>{a.id}</td>
              
              {/* Nombre con lupa */}
              <td style={{ padding: '12px 10px', fontWeight: '600', color: '#111827' }}>
                {a.nombre}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MembersTable;