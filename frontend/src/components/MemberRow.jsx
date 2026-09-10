// src/components/MemberRow.jsx
//Tablas de MembersTable
import React from 'react';

function MemberRow({ 
  afiliado, 
  verHistorico, 
  estaOculta, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave, 
  onStartEdit,
  onOpenBitacora,
  onOpenTransaccion,
  onOpenDetalleComision,
  onDelete
}) {
  const a = afiliado;
  const esActivo = a.estado === 'Activo';
  const cupos = a.cupos_libres ?? 15;
  const compradoresDirectos = a.compradores_directos || 0;
  const compradoresRed = a.compradores_en_red || 0;

  // CONDICIÓN DE RESALTADO:
  // Se resalta ÚNICAMENTE si recibe bono de liderazgo
  const tieneBonoLiderazgo = (a.bono_liderazgo || 0) > 0;

  // Definición dinámica del color de fondo de la fila en VERDE
  const obtenerFondoFila = () => {
    if (isHovered) {
      return tieneBonoLiderazgo ? '#d1fae5' : '#f8fafc'; // Hover verde claro suave o neutro
    }
    return tieneBonoLiderazgo ? '#ecfdf5' : '#ffffff'; // Fondo verde muy claro tenue para resaltar
  };

  return (
    <tr 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ 
        backgroundColor: obtenerFondoFila(), 
        borderBottom: '1px solid #f1f5f9', 
        borderLeft: tieneBonoLiderazgo ? '4px solid #10b981' : 'none', // Borde lateral verde si resalta
        transition: 'background-color 0.15s ease' 
      }}
    >
      {/* ID Badge */}
      {!estaOculta('id') && (
        <td style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
          <span style={{ 
            backgroundColor: tieneBonoLiderazgo ? '#d1fae5' : '#EEF2FF', 
            color: tieneBonoLiderazgo ? '#047857' : '#4338CA', 
            padding: '4px 8px', 
            borderRadius: '6px', 
            fontSize: '11px', 
            fontWeight: '700',
            display: 'inline-block'
          }}>
            #{a.id} {tieneBonoLiderazgo && '⭐'}
          </span>
        </td>
      )}

      {/* Nombre y Apellido */}
      {!estaOculta('nombre') && (
        <td style={{ padding: '12px' }}>
          <button
            type="button"
            onClick={() => onStartEdit(a)}
            title="Hacer clic para editar afiliado"
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              margin: '-4px -8px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'background-color 0.2s, color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
              const icon = e.currentTarget.querySelector('.edit-icon');
              if (icon) icon.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              const icon = e.currentTarget.querySelector('.edit-icon');
              if (icon) icon.style.opacity = '0.4';
            }}
          >
            <span style={{ fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap' }}>
              {a.nombre} {a.apellido || ''}
            </span>
            <span 
              className="edit-icon"
              style={{ fontSize: '13px', opacity: 0.4, transition: 'opacity 0.2s', color: '#2563eb' }}
            >
              ✏️
            </span>
          </button>
        </td>
      )}

      {/* Celular */}
      {!estaOculta('celular') && (
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
      )}

      {/* Patrocinador */}
      {!estaOculta('patrocinador') && (
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
      )}

      {/* Cupos Libres */}
      {!estaOculta('cupos') && (
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
      )}

      {/* Compradores */}
      {!estaOculta('compradores') && (
        <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
          <span style={{ 
            backgroundColor: compradoresDirectos > 0 ? '#f0fdf4' : '#f8fafc', 
            color: compradoresDirectos > 0 ? '#475871' : '#640000', 
            border: `1px solid ${compradoresDirectos > 0 ? '#9f9e9b' : '#e2e8f0'}`,
            padding: '4px 10px', 
            borderRadius: '20px', 
            fontSize: '11px',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            {compradoresDirectos} Directos ({compradoresRed} Red)
          </span>
        </td>
      )}

      {/* Estado */}
      {!estaOculta('estado') && (
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
      )}

      {/* Nivel */}
      {!estaOculta('nivel') && (
        <td style={{ padding: '12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
          <span style={{ 
            backgroundColor: tieneBonoLiderazgo ? '#d1fae5' : '#f1f5f9', 
            color: tieneBonoLiderazgo ? '#047857' : '#334155', 
            border: tieneBonoLiderazgo ? '1px solid #a7f3d0' : 'none',
            padding: '4px 8px', 
            borderRadius: '6px', 
            fontSize: '11px', 
            fontWeight: '700' 
          }}>
            Nivel {a.nivel}
          </span>
        </td>
      )}

      {/* U. Acumulada */}
      {!estaOculta('utilidad') && (
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
      )}

      {/* Total Comisiones */}
      {!estaOculta('total') && (
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
      )}

      {/* Acciones */}
      {!estaOculta('acciones') && (
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
      )}
    </tr>
  );
}

export default MemberRow;