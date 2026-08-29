// src/components/MembersTable.jsx
import React, { useState, useRef } from 'react';
import ModificarAfiliado from './ModificarAfiliado';
import { apiService } from '../services/api'; // 👈 Asegúrate de importar apiService

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
  
  // Estado para controlar qué columnas están ocultas
  const [columnasOcultas, setColumnasOcultas] = useState([]);

  // Objeto con los nombres amigables de cada columna para los botones de restauración
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingAfiliado, setPendingAfiliado] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verificando, setVerificando] = useState(false);
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

  const handleStartEdit = (afiliado) => {
    setPendingAfiliado(afiliado);
    setPasswordInput('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  const handleSaveFromModal = (datosActualizados) => {
    if (onSaveEdit) {
      onSaveEdit(datosActualizados);
    }
    setAfiliadoAEditar(null);
  };

  // 🛠️ FUNCIÓN CORREGIDA Y CONECTADA A apiService 🛠️
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setVerificando(true);
    setPasswordError('');

    try {
      // Extrae el nombre de usuario de las props o usa 'admin' por defecto
      const usernameActual = adminUser?.usuario || adminUser?.username || adminUser?.correo || 'admin';

      // Llamada al método centralizado en api.js que consulta /api/auth/verify-password
      await apiService.verificarPassword(passwordInput, usernameActual);

      // Si no lanza error, la contraseña es correcta:
      setShowPasswordModal(false);
      setAfiliadoAEditar(pendingAfiliado);
      setPendingAfiliado(null);
      setPasswordInput('');
    } catch (err) {
      setPasswordError(err.message || 'Contraseña incorrecta o error de conexión.');
    } finally {
      setVerificando(false);
    }
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

      {/* Panel de Columnas Ocultas para Volverlas a Mostrar */}
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
                <th 
                  onClick={() => toggleColumna('id')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  ID
                </th>
              )}
              {!estaOculta('nombre') && (
                <th 
                  onClick={() => toggleColumna('nombre')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Nombre y Apellido 👁️‍🗨️
                </th>
              )}
              {!estaOculta('celular') && (
                <th 
                  onClick={() => toggleColumna('celular')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Celular 👁️‍🗨️
                </th>
              )}
              {!estaOculta('patrocinador') && (
                <th 
                  onClick={() => toggleColumna('patrocinador')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Patrocinador 👁️‍🗨️
                </th>
              )}
              {!estaOculta('cupos') && (
                <th 
                  onClick={() => toggleColumna('cupos')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Cupos Libres 👁️‍🗨️
                </th>
              )}
              {!estaOculta('compradores') && (
                <th 
                  onClick={() => toggleColumna('compradores')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Compradores 👁️‍🗨️
                </th>
              )}
              {!estaOculta('estado') && (
                <th 
                  onClick={() => toggleColumna('estado')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Estado 👁️‍🗨️
                </th>
              )}
              {!estaOculta('nivel') && (
                <th 
                  onClick={() => toggleColumna('nivel')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Nivel 👁️‍🗨️
                </th>
              )}
              {!estaOculta('utilidad') && (
                <th 
                  onClick={() => toggleColumna('utilidad')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  U. Acumulada 👁️‍🗨️
                </th>
              )}
              {!estaOculta('total') && (
                <th 
                  onClick={() => toggleColumna('total')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  Total 👁️‍🗨️
                </th>
              )}
              {!estaOculta('acciones') && (
                <th 
                  onClick={() => toggleColumna('acciones')} 
                  title="Haz clic para ocultar columna"
                  style={{ padding: '14px 12px', textAlign: 'center', fontWeight: '700', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
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
              listaFiltrada.map(a => {
                const esActivo = a.estado === 'Activo';
                const isHovered = hoveredRow === a.id;
                const cupos = a.cupos_libres ?? 15;
                const compradoresDirectos = a.compradores_directos || 0;
                const compradoresRed = a.compradores_en_red || 0;

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
                    {!estaOculta('id') && (
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
                    )}

                    {/* Nombre y Apellido */}
                    {!estaOculta('nombre') && (
                      <td style={{ padding: '12px' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(a)}
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
                            style={{ 
                              fontSize: '13px', 
                              opacity: 0.4, 
                              transition: 'opacity 0.2s',
                              color: '#2563eb' 
                            }}
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Contraseña */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px',
            width: '100%', maxWidth: '360px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
              🔒 Confirmación de Seguridad
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
              Ingresa tu contraseña para editar a <strong>{`${pendingAfiliado?.nombre || ''} ${pendingAfiliado?.apellido || ''}`.trim()}</strong>.
            </p>

            <form onSubmit={handleVerifyPassword}>
              <input
                type="password"
                placeholder="Contraseña de administrador"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                disabled={verificando}
                style={{
                  width: '100%', padding: '10px 14px', fontSize: '13px',
                  border: `1px solid ${passwordError ? '#ef4444' : '#cbd5e1'}`,
                  borderRadius: '10px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px'
                }}
              />
              {passwordError && (
                <span style={{ color: '#ef4444', fontSize: '12px', display: 'block', marginBottom: '12px' }}>
                  {passwordError}
                </span>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPendingAfiliado(null);
                    setPasswordInput('');
                    setPasswordError('');
                  }}
                  disabled={verificando}
                  style={{
                    backgroundColor: '#f1f5f9', border: 'none', color: '#475569',
                    padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={verificando}
                  style={{
                    backgroundColor: '#4f46e5', border: 'none', color: '#ffffff',
                    padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    opacity: verificando ? 0.7 : 1
                  }}
                >
                  {verificando ? 'Verificando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
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