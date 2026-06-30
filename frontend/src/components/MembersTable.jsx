// src/components/MembersTable.jsx
import React from 'react';

function MembersTable({ verHistorico, datosHistoricos, afiliados, onOpenBitacora, onOpenTransaccion, onDelete }) {
  const listaA_Mostrar = verHistorico ? datosHistoricos : afiliados;

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
        {verHistorico ? 'Historial de Miembros' : '📊 Árbol y Bitácora Activa'}
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '10px' }}>ID</th>
            <th style={{ padding: '10px' }}>Nombre</th>
            <th style={{ padding: '10px' }}>Patrocinador</th>
            <th style={{ padding: '10px' }}>Estado</th>
            <th style={{ padding: '10px' }}>Nivel</th>
            <th style={{ padding: '10px' }}>U. Acumulada</th>
            <th style={{ padding: '10px', textAlign: 'right' }}>Total Com.</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {listaA_Mostrar.map(a => (
            <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px' }}>{a.id}</td>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>
                {a.nombre}
                {!verHistorico && (
                  <button 
                    type="button" 
                    onClick={() => onOpenBitacora(a)} 
                    style={{ marginLeft: '6px', cursor: 'pointer', background: 'none', border: 'none' }}
                  >
                    🔍
                  </button>
                )}
              </td>
              <td style={{ padding: '10px' }}>
                {verHistorico ? 'N/A' : (a.nombre_patrocinador || <em style={{ color: '#9ca3af' }}>Raíz</em>)}
              </td>
              <td style={{ padding: '10px' }}>{a.estado}</td>
              <td style={{ padding: '10px' }}>{a.nivel}</td>
              <td style={{ padding: '10px' }}>
                {a.utilidad_propia} 
                {!verHistorico && (
                  <button 
                    type="button" 
                    onClick={() => onOpenTransaccion(a)} 
                    style={{ marginLeft: '6px', cursor: 'pointer', padding: '2px 6px', fontSize: '11px' }}
                  >
                    💸 +/-
                  </button>
                )}
              </td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                {Math.round(a.comision_total)}
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {!verHistorico && (
                  <button 
                    onClick={() => onDelete(a.id)} 
                    style={{ cursor: 'pointer', background: 'none', border: 'none' }}
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