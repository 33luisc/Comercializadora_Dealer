// src/components/MembersTable.jsx
import React, { useState, useRef } from 'react';
import ModificarAfiliado from './ModificarAfiliado';
import PasswordConfirmModal from './PasswordConfirmModal';
import MemberRow from './MemberRow';

function MembersTable({ 
  verHistorico, 
  datosHistoricos = [], 
  afiliados = [], 
  adminUser,
  onOpenBitacora, 
  onOpenTransaccion, 
  onOpenDetalleComision, 
  onDelete,
  onSaveEdit
}) {
  const [busqueda, setBusqueda] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [columnasOcultas, setColumnasOcultas] = useState([]);

  const NOMBRES_COLUMNAS = {
    id: 'ID',
    nombre: 'Nombre y Apellido',
    celular: 'Celular',
    patrocinador: 'Patrocinador',
    cupos: 'Cupos Libres',
    compradores: 'Compradores',
    estado: 'Estado',
    nivel: 'Nivel',
    utilidad: 'U. Acumulada',
    total: 'Total',
    acciones: 'Acciones'
  };

  const toggleColumna = (clave) => {
    setColumnasOcultas(prev => 
      prev.includes(clave) 
        ? prev.filter(col => col !== clave) 
        : [...prev, clave]
    );
  };

  const mostrarTodasColumnas = () => setColumnasOcultas([]);

  const [pendingAfiliado, setPendingAfiliado] = useState(null);
  const [afiliadoAEditar, setAfiliadoAEditar] = useState(null);

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
    if (['BUTTON', 'A', 'INPUT', 'SPAN', 'SVG', 'PATH', 'SELECT', 'TH'].includes(e.target.tagName)) return;
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

  const estaOculta = (clave) => columnasOcultas.includes(clave);

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '16px', 
      padding: '24px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Barra de Búsqueda, Contador y Columnas Ocultas */}
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

      {/* Panel de Columnas Ocultas */}
      {columnasOcultas.length > 0 && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '10px 14px', 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          fontSize: '12px'
        }}>
          <span style={{ fontWeight: '600', color: '#0369a1' }}>Columnas ocultas (haz clic para mostrar):</span>
          {columnasOcultas.map(colKey => (
            <button
              key={colKey}
              type="button"
              onClick={() => toggleColumna(colKey)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #0284c7',
                color: '#0284c7',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ➕ {NOMBRES_COLUMNAS[colKey]}
            </button>
          ))}
          <button
            type="button"
            onClick={mostrarTodasColumnas}
            style={{
              backgroundColor: '#0284c7',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            Mostrar Todas
          </button>
        </div>
      )}

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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', minWidth: '600px' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 10 }}>
            <tr style={{ color: '#475569', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {!estaOculta('id') && (
                <th onClick={() => toggleColumna('id')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  ID
                </th>
              )}
              {!estaOculta('nombre') && (
                <th onClick={() => toggleColumna('nombre')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Nombre y Apellido 👁️‍🗨️
                </th>
              )}
              {!estaOculta('celular') && (
                <th onClick={() => toggleColumna('celular')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Celular 👁️‍🗨️
                </th>
              )}
              {!estaOculta('patrocinador') && (
                <th onClick={() => toggleColumna('patrocinador')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Patrocinador 👁️‍🗨️
                </th>
              )}
              {!estaOculta('cupos') && (
                <th onClick={() => toggleColumna('cupos')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Cupos Libres 👁️‍🗨️
                </th>
              )}
              {!estaOculta('compradores') && (
                <th onClick={() => toggleColumna('compradores')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Compradores 👁️‍🗨️
                </th>
              )}
              {!estaOculta('estado') && (
                <th onClick={() => toggleColumna('estado')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Estado 👁️‍🗨️
                </th>
              )}
              {!estaOculta('nivel') && (
                <th onClick={() => toggleColumna('nivel')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Nivel 👁️‍🗨️
                </th>
              )}
              {!estaOculta('utilidad') && (
                <th onClick={() => toggleColumna('utilidad')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  U. Acumulada 👁️‍🗨️
                </th>
              )}
              {!estaOculta('total') && (
                <th onClick={() => toggleColumna('total')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Total 👁️‍🗨️
                </th>
              )}
              {!estaOculta('acciones') && (
                <th onClick={() => toggleColumna('acciones')} title="Haz clic para ocultar columna" style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
                  Acciones 👁️‍🗨️
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No se encontraron miembros.
                </td>
              </tr>
            ) : (
              listaFiltrada.map(a => (
                <MemberRow 
                  key={a.id}
                  afiliado={a}
                  verHistorico={verHistorico}
                  estaOculta={estaOculta}
                  isHovered={hoveredRow === a.id}
                  onMouseEnter={() => setHoveredRow(a.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onStartEdit={(af) => setPendingAfiliado(af)}
                  onOpenBitacora={onOpenBitacora}
                  onOpenTransaccion={onOpenTransaccion}
                  onOpenDetalleComision={onOpenDetalleComision}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Contraseña */}
      {pendingAfiliado && (
        <PasswordConfirmModal 
          pendingAfiliado={pendingAfiliado}
          adminUser={adminUser}
          onSuccess={() => {
            setAfiliadoAEditar(pendingAfiliado);
            setPendingAfiliado(null);
          }}
          onClose={() => setPendingAfiliado(null)}
        />
      )}

      {/* Modal de Edición */}
      {afiliadoAEditar && (
        <ModificarAfiliado 
          afiliado={afiliadoAEditar} 
          onSave={(datos) => {
            if (onSaveEdit) onSaveEdit(datos);
            setAfiliadoAEditar(null);
          }} 
          onClose={() => setAfiliadoAEditar(null)} 
        />
      )}
    </div>
  );
}

export default MembersTable;