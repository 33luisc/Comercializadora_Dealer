// src/components/MembersTable.jsx
import React, { useState, useRef } from 'react';

function MembersTable({ 
  verHistorico, 
  datosHistoricos = [], 
  afiliados = [], 
  onOpenBitacora, 
  onOpenTransaccion, 
  onOpenDetalleComision, 
  onDelete 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);

  const tableContainerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);  

  const listaOriginal = verHistorico ? datosHistoricos : afiliados;

  const listaFiltrada = listaOriginal.filter(a => {
    if (!busqueda.trim()) return true;

    const limpiarTexto = (texto) => 
      String(texto || '')
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    const q = limpiarTexto(busqueda.trim());
    const nombreCompleto = limpiarTexto(`${a.nombre || ''} ${a.apellido || ''}`);
    const cedula = limpiarTexto(a.cedula);
    const celular = limpiarTexto(a.celular);
    const id = limpiarTexto(a.id);

    return (
      nombreCompleto.includes(q) || 
      cedula.includes(q) || 
      celular.includes(q) || 
      id.includes(q)
    );
  });

  const handleMouseDown = (e) => {
    if (['BUTTON', 'A', 'INPUT', 'SPAN', 'SVG', 'PATH'].includes(e.target.tagName)) return;
    setIsMouseDown(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsMouseDown(false);
  const handleMouseUp = () => setIsMouseDown(false);

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '16px', 
      padding: '24px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Barra de Búsqueda y Contador */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '12px', 
        flexWrap: 'wrap' 
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
          <input 
            type="text" 
            placeholder="Buscar por nombre, cédula, celular o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              width: '100%',
              padding: '10px 14px 10px 38px',
              fontSize: '13px',
              color: '#0f172a',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#6366f1';
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
          <svg 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div style={{ 
          fontSize: '12px', 
          color: '#64748b', 
          backgroundColor: '#f1f5f9', 
          padding: '6px 12px', 
          borderRadius: '8px', 
          fontWeight: '500' 
        }}>
          Mostrando <strong style={{ color: '#0f172a' }}>{listaFiltrada.length}</strong> de <strong style={{ color: '#0f172a' }}>{listaOriginal.length}</strong>
        </div>
      </div>

      {/* Contenedor de Tabla con Arrastre */}
      <div 
        ref={tableContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0', 
          overflowX: 'auto', 
          overflowY: 'auto',
          maxHeight: '540px',
          width: '100%',
          cursor: isMouseDown ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '980px' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 10 }}>
            <tr style={{ color: '#475569', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>ID</th>
              <th style={{ padding: '14px 12px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Nombre y Apellido</th>
              <th style={{ padding: '14px 12px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Celular</th>
              <th style={{ padding: '14px 12px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Patrocinador</th>
              <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Cupos Libres</th>
              <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Compradores</th>
              <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Estado</th>
              <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Nivel</th>
              <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>U. Acumulada</th>
              <th style={{ padding: '14px 12px', textAlign: 'right', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Total</th>
              <th style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No se encontraron miembros.
                </td>
              </tr>
            ) : (
              listaFiltrada.map(a => {
                const esActivo = a.estado === 'Activo';
                const isHovered = hoveredRow === a.id;
                const cupos = a.cupos_libres ?? 15;
                const compradores = a.compradores_en_red || 0;

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
                    {/* ID Badge */}
                    <td style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        backgroundColor: '#EEF2FF', 
                        color: '#4338CA', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        display: 'inline-block'
                      }}>
                        #{a.id}
                      </span>
                    </td>

                    {/* Nombre y Apellido */}
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {a.nombre} {a.apellido || ''}
                      </span>
                    </td>

                    {/* Celular con Icono */}
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      {a.celular ? (
                        <a 
                          href={`https://wa.me/57${a.celular.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#2563eb', 
                            textDecoration: 'none', 
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Abrir WhatsApp"
                        >
                          <svg style={{ width: '14px', height: '14px', color: '#16a34a' }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                          </svg>
                          {a.celular}
                        </a>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>

                    {/* Patrocinador */}
                    <td style={{ padding: '12px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {verHistorico ? '—' : (
                        a.nombre_patrocinador ? (
                          <span style={{ fontWeight: '500' }}>{a.nombre_patrocinador}</span>
                        ) : (
                          <span style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontWeight: '600', color: '#64748b' }}>
                            Raíz
                          </span>
                        )
                      )}
                    </td>

                    {/* Cupos Libres */}
                    <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        backgroundColor: cupos > 0 ? '#fffbeb' : '#f0f9ff', 
                        color: cupos > 0 ? '#b45309' : '#0369a1', 
                        border: `1px solid ${cupos > 0 ? '#fef3c7' : '#e0f2fe'}`,
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {cupos > 0 ? `${cupos} libre${cupos > 1 ? 's' : ''}` : 'Red Completa'}
                      </span>
                    </td>

                    {/* Compradores */}
                    <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        backgroundColor: compradores > 0 ? '#f0fdf4' : '#f8fafc', 
                        color: compradores > 0 ? '#475871':'#640000', 
                        border: `1px solid ${compradores > 0 ? '#9f9e9b' : '#e2e8f0'}`,
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {compradores} comprador{compradores !== 1 ? 'es' : ''}
                      </span>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: esActivo ? '#ecfdf5' : '#f3f4f6',
                        color: esActivo ? '#047857' : '#6b7280',
                        border: `1px solid ${esActivo ? '#a7f3d0' : '#e5e7eb'}`
                      }}>
                        {a.estado || 'Activo'}
                      </span>
                    </td>

                    {/* Nivel */}
                    <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        backgroundColor: '#f1f5f9', 
                        color: '#334155', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: '600' 
                      }}>
                        Nivel {a.nivel}
                      </span>
                    </td>

                    {/* U. Acumulada */}
                    <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => !verHistorico && onOpenBitacora?.(a)}
                          disabled={verHistorico}
                          title={verHistorico ? '' : 'Ver Bitácora de Transacciones'}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            margin: 0,
                            font: 'inherit',
                            fontWeight: '600',
                            color: (a.utilidad_propia || 0) >= 0 ? '#16a34a' : '#dc2626',
                            cursor: verHistorico ? 'default' : 'pointer',
                            textDecoration: verHistorico ? 'none' : 'underline',
                            textDecorationStyle: 'dotted'
                          }}
                        >
                          ${Number(a.utilidad_propia || 0).toLocaleString('es-CO')}
                        </button>
                        {!verHistorico && (
                          <button 
                            type="button" 
                            onClick={() => onOpenTransaccion?.(a)} 
                            title="Ajustar Saldo"
                            style={{ 
                              cursor: 'pointer', 
                              padding: '4px 8px', 
                              fontSize: '11px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontWeight: '600',
                              color: '#475569',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#e2e8f0';
                              e.currentTarget.style.color = '#0f172a';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8fafc';
                              e.currentTarget.style.color = '#475569';
                            }}
                          >
                            +/-
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Total Comisiones */}
                    <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => !verHistorico && onOpenDetalleComision?.(a)}
                        disabled={verHistorico}
                        title={verHistorico ? '' : 'Ver desglose de comisiones'}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          font: 'inherit',
                          fontWeight: '700',
                          color: verHistorico ? '#94a3b8' : '#2563eb',
                          cursor: verHistorico ? 'default' : 'pointer'
                        }}
                      >
                        ${Number(Math.round(a.comision_total || 0)).toLocaleString('es-CO')}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {!verHistorico && (
                        <button 
                          onClick={() => onDelete?.(a.id)} 
                          style={{ 
                            cursor: 'pointer', 
                            background: '#fef2f2', 
                            border: '1px solid #fee2e2', 
                            color: '#ef4444',
                            borderRadius: '8px',
                            padding: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                          }}
                          title="Eliminar Miembro"
                        >
                          <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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