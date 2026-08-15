// src/components/MembersTable.jsx
import React, { useState, useRef } from 'react';

function MembersTable({ verHistorico, datosHistoricos = [], afiliados = [], onOpenBitacora, onOpenTransaccion, onDelete }) {
  const [busqueda, setBusqueda] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);

  // Referencia y estados para el comportamiento de arrastrar con el mouse (Drag to Scroll)
  const tableContainerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const listaOriginal = verHistorico ? datosHistoricos : afiliados;

  const listaFiltrada = listaOriginal.filter(a => {
  if (!busqueda.trim()) return true;

  // Función interna para convertir a minúsculas Y quitar tildes
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

  // Manejadores para el arrastre tipo mano (grab/grabbing)
  const handleMouseDown = (e) => {
    // Evita activar el arrastre si se hace clic en botones o enlaces dentro de la tabla
    if (['BUTTON', 'A', 'INPUT', 'SPAN'].includes(e.target.tagName)) return;
    
    setIsMouseDown(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

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
      borderRadius: '14px', 
      padding: '20px',
      fontFamily: 'sans-serif',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Barra de Búsqueda y Contador */}
      <div style={{ 
        marginTop: '4px',
        marginBottom: '20px', 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        gap: '12px', 
        flexWrap: 'wrap' 
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
          <input 
            type="text" 
            placeholder="Buscar por nombre, cédula, celular o ID..."
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

      {/* Contenedor con Scroll e Interactividad de Mano (Drag-to-scroll) */}
      <div 
        ref={tableContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ 
          borderRadius: '10px', 
          border: '1px solid #e2e8f0', 
          overflowX: 'auto', 
          overflowY: 'auto',
          maxHeight: '520px',
          width: '100%',
          cursor: isMouseDown ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '950px' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 10 }}>
            <tr style={{ backgroundColor: '#f8fafc', color: '#475569', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>ID</th>
              <th style={{ padding: '12px 10px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Nombre y Apellido</th>
              <th style={{ padding: '12px 10px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Celular</th>
              <th style={{ padding: '12px 10px', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Patrocinador</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Cupos Libres</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Compradores</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Estado</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Nivel</th>
              <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>U. Acumulada</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0' }}>Total</th>
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
                    {/* ID */}
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

                    {/* Nombre y Apellido + Botón Bitácora */}
                    <td style={{ padding: '10px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        gap: '8px',
                        width: '100%'
                      }}>
                        <span style={{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {a.nombre} {a.apellido || ''}
                        </span>              
                      </div>
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
                    <td style={{ padding: '10px', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {verHistorico ? 'N/A' : (a.nombre_patrocinador || <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', color: '#64748b' }}>Raíz</span>)}
                    </td>

                    {/* Personas que aún te hacen falta para llegar a 15 afiliados */}
                    <td style={{ padding: '10px', color: '#0f172a', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        // Ámbar si le quedan cupos libres, Azul suave si ya completó los 15 (0 cupos libres)
                        backgroundColor: (a.cupos_libres ?? 15) > 0 ? '#fef3c7' : '#e0f2fe', 
                        color: (a.cupos_libres ?? 15) > 0 ? '#b45309' : '#0369a1', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontWeight: '600' 
                      }}>
                        {(a.cupos_libres ?? 15) > 0 
                          ? `🎯 ${a.cupos_libres ?? 15} cupos` 
                          : '✅ Red completa'}
                      </span>
                    </td>

                    {/* Personas de tu red que han comprado */}
                    <td style={{ padding: '10px', color: '#0f172a', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        // Verde si tiene al menos 1 comprador, Gris/Rojo suave si no tiene ninguno
                        backgroundColor: (a.compradores_en_red || 0) > 0 ? '#dcfce7' : '#f1f5f9', 
                        color: (a.compradores_en_red || 0) > 0 ? '#15803d' : '#64748b', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontWeight: '600' 
                      }}>
                        🛒 {a.compradores_en_red || 0} compradores
                      </span>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
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
                    <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#000000', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        Nivel {a.nivel}
                      </span>
                    </td>

                    {/* U. Acumulada */}
                    <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                        type="button"
                        onClick={() => !verHistorico && onOpenBitacora(a)}
                        disabled={verHistorico}
                        title={verHistorico ? '' : 'Ver Bitácora de Transacciones'}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          font: 'inherit',
                          fontWeight: '600',
                          // Mantiene el color original según la utilidad (rojo si es negativo)
                          color: (a.utilidad_propia || 0) >= 0 ? '#277d00' : '#dc2626',
                          cursor: verHistorico ? 'default' : 'pointer',
                          textDecoration: verHistorico ? 'none' : 'underline', // Subrayado para indicar interactividad
                          textDecorationStyle: 'dotted', // Opcional: punteado para diferenciarlo de un link normal
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.2s',
                          opacity: isHovered && !verHistorico ? 0.75 : 1
                        }}
                      >
                        ${Number(a.utilidad_propia || 0).toLocaleString('es-CO')}
                      </button>
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
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#040405', whiteSpace: 'nowrap' }}>
                      ${Number(Math.round(a.comision_total || 0)).toLocaleString('es-CO')}
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
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