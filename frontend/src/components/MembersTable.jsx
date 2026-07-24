// src/components/MembersTable.jsx
import React, { useState } from 'react';

function MembersTable({ verHistorico, datosHistoricos = [], afiliados = [], onOpenBitacora, onOpenTransaccion, onDelete }) {
  const [busqueda, setBusqueda] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);

  const listaOriginal = verHistorico ? datosHistoricos : afiliados;

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
      borderRadius: '14px', 
      padding: '0',
      overflowX: 'auto', 
      fontFamily: 'sans-serif',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Barra de Búsqueda */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
          <input 
            type="text" 
            placeholder="🔍 Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              width: '100%',
              padding: '8px 12px 8px 34px',
              fontSize: '13px',
              color: '#1e293b',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px' }}>
            🔍
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '6px 10px', borderRadius: '8px', fontWeight: '500' }}>
          Mostrando <strong style={{ color: '#0f172a' }}>{listaFiltrada.length}</strong> de <strong style={{ color: '#0f172a' }}>{listaOriginal.length}</strong>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ borderRadius: '10px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '850px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', color: '#475569', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>ID</th>
              <th style={{ padding: '12px 10px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Nombre y Apellido</th>
              <th style={{ padding: '12px 10px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Cédula</th>
              <th style={{ padding: '12px 10px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Celular</th>
              <th style={{ padding: '12px 10px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Patrocinador</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Estado</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Nivel</th>
              <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>U. Acumulada</th>
              <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Total Com.</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No se encontraron miembros.
                </td>
              </tr>
            ) : (
              listaFiltrada.map(a => {
                const esActivo = a.estado === 'Activo';
                const isHovered = hoveredRow === a.id;

                return (
                  <tr 
                    key={a.id} 
                    onMouseEnter={() => setHoveredRow(a.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ 
                      backgroundColor: isHovered ? '#f8fafc' : '#ffffff', 
                      borderBottom: '1px solid #f1f5f9', 
                      transition: 'background-color 0.15s ease' 
                    }}
                  >
                    {/* 1. CORRECCIÓN DE ID (whiteSpace: 'nowrap' e inline-block) */}
                    <td style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        backgroundColor: '#1e293b', 
                        color: '#ffffff', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        display: 'inline-block',
                        whiteSpace: 'nowrap'
                      }}>
                        ID {a.id}
                      </span>
                    </td>

                    {/* 2. CORRECCIÓN DE ALINEACIÓN DEL LIBRO DE BITÁCORA */}
                    <td style={{ padding: '10px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        gap: '8px',
                        width: '100%'
                      }}>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>
                          {a.nombre} {a.apellido || ''}
                        </span>

                        {!verHistorico && (
                          <button 
                            type="button" 
                            onClick={() => onOpenBitacora(a)} 
                            style={{ 
                              cursor: 'pointer', 
                              background: '#eff6ff', 
                              border: '1px solid #bfdbfe', 
                              color: '#1d4ed8',
                              borderRadius: '6px', 
                              padding: '3px 6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0, // Evita que el botón se deforme
                              transition: 'all 0.2s',
                              opacity: isHovered ? 1 : 0.7
                            }}
                            title="Ver Bitácora de Transacciones"
                          >
                            <span style={{ fontSize: '13px' }}>📖</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Cédula */}
                    <td style={{ padding: '10px', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {a.cedula ? (
                        <span>🆔 {Number(a.cedula).toLocaleString('es-CO')}</span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>N/A</span>
                      )}
                    </td>

                    {/* Celular */}
                    <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                      {a.celular ? (
                        <a 
                          href={`https://wa.me/57${a.celular.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}
                          title="Abrir WhatsApp"
                        >
                          📱 {a.celular}
                        </a>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>N/A</span>
                      )}
                    </td>

                    {/* Patrocinador */}
                    <td style={{ padding: '10px', color: '#475569', fontSize: '12px' }}>
                      {verHistorico ? 'N/A' : (a.nombre_patrocinador || <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', color: '#64748b' }}>Raíz</span>)}
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: esActivo ? '#dcfce7' : '#f3f4f6',
                        color: esActivo ? '#16a34a' : '#6b7280'
                      }}>
                        {a.estado || 'Activo'}
                      </span>
                    </td>

                    {/* Nivel */}
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        Nivel {a.nivel}
                      </span>
                    </td>

                    {/* U. Acumulada */}
                    <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <span style={{ fontWeight: '600', color: (a.utilidad_propia || 0) >= 0 ? '#1e293b' : '#dc2626' }}>
                          ${Number(a.utilidad_propia || 0).toLocaleString('es-CO')}
                        </span>
                        {!verHistorico && (
                          <button 
                            type="button" 
                            onClick={() => onOpenTransaccion(a)} 
                            style={{ 
                              cursor: 'pointer', 
                              padding: '2px 6px', 
                              fontSize: '11px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '5px',
                              fontWeight: '600',
                              color: '#334155'
                            }}
                          >
                            💸 +/-
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Total Comisiones */}
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#2563eb', whiteSpace: 'nowrap' }}>
                      ${Number(Math.round(a.comision_total || 0)).toLocaleString('es-CO')}
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {!verHistorico && (
                        <button 
                          onClick={() => onDelete(a.id)} 
                          style={{ 
                            cursor: 'pointer', 
                            background: '#fee2e2', 
                            border: '1px solid #fecaca', 
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '4px 6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Eliminar Miembro"
                        >
                          <span style={{ fontSize: '12px' }}>🗑️</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MembersTable;