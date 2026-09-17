// src/components/NetworkTree/NodoArbol.jsx
import React, { useState, useEffect } from 'react';
import './NetworkTree.css';

const PALETA_NIVELES = [
  { border: '#4f46e5', bgBadge: '#e0e7ff', textBadge: '#3730a3', bgTag: '#eef2ff' },
  { border: '#2563eb', bgBadge: '#dbeafe', textBadge: '#1e40af', bgTag: '#eff6ff' },
  { border: '#059669', bgBadge: '#d1fae5', textBadge: '#065f46', bgTag: '#ecfdf5' },
  { border: '#7c3aed', bgBadge: '#ede9fe', textBadge: '#5b21b6', bgTag: '#f5f3ff' },
  { border: '#d97706', bgBadge: '#fef3c7', textBadge: '#92400e', bgTag: '#fffbe6' },
  { border: '#db2777', bgBadge: '#fce7f3', textBadge: '#9d174d', bgTag: '#fdf2f8' },
  { border: '#0891b2', bgBadge: '#cffaff', textBadge: '#155e75', bgTag: '#ecfeff' },
];

function NodoArbol({ 
  miembro, 
  todosLosAfiliados = [], 
  controlExpandir, 
  coincidenciaIds, 
  onOpenDetalleComision, 
  onOpenBitacora,
  onOpenTransaccion,
  verHistorico = false,
  esRaiz = false,
  nivel = 0 
}) {
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    if (controlExpandir && typeof controlExpandir.expandir === 'boolean') {
      setExpandido(controlExpandir.expandir);
    }
  }, [controlExpandir?.timestamp]);

  const hijos = todosLosAfiliados.filter(
    (a) => Number(a.id_patrocinador) === Number(miembro.id)
  );
  const tieneHijos = hijos.length > 0;

  const contarRedTotal = (nodo) => {
    const directos = todosLosAfiliados.filter(a => Number(a.id_patrocinador) === Number(nodo.id));
    let total = directos.length;
    directos.forEach(hijo => { total += contarRedTotal(hijo); });
    return total;
  };

  const totalRed = contarRedTotal(miembro);
  const esCoincidencia = coincidenciaIds && coincidenciaIds.has(miembro.id);
  const iniciales = `${miembro.nombre?.charAt(0) || ''}${miembro.apellido?.charAt(0) || ''}`.toUpperCase();
  const estiloNivel = PALETA_NIVELES[nivel % PALETA_NIVELES.length];

  const utilidadPropiaVal = Number(miembro.utilidad_propia || 0);

  return (
    <div className="tree-node-wrapper">
      
      {/* TARJETA DEL NODO */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '210px',
          padding: '12px 14px',
          backgroundColor: esCoincidencia ? '#eff6ff' : '#ffffff',
          border: esCoincidencia ? '2px solid #3b82f6' : '1px solid #e2e8f0',
          borderTop: `4px solid ${estiloNivel.border}`,
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Encabezado: ID y Nivel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px', alignItems: 'center' }}>
          <span 
            style={{ 
              backgroundColor: estiloNivel.bgBadge, 
              color: estiloNivel.textBadge, 
              fontSize: '10px', 
              fontWeight: '700', 
              padding: '2px 6px', 
              borderRadius: '4px' 
            }}
          >
            #{miembro.id}
          </span>

          <span 
            style={{ 
              fontSize: '10px', 
              fontWeight: '700', 
              color: estiloNivel.textBadge, 
              backgroundColor: estiloNivel.bgTag,
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${estiloNivel.border}33`
            }}
          >
            Niv {nivel}
          </span>
        </div>

        {/* Avatar Circular */}
        <div 
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: estiloNivel.border,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {iniciales}
        </div>

        {/* Nombre Completo */}
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', textAlign: 'center', lineHeight: '1.2', marginBottom: '6px' }}>
          {miembro.nombre} {miembro.apellido}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {miembro.es_lider && (
            <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '9px', fontWeight: '700', padding: '2px 5px', borderRadius: '4px' }}>
              LÍDER
            </span>
          )}
          <span 
            style={{
              fontSize: '9px',
              fontWeight: '600',
              padding: '2px 5px',
              borderRadius: '4px',
              backgroundColor: miembro.estado === 'Inactivo' ? '#f1f5f9' : '#dcfce7',
              color: miembro.estado === 'Inactivo' ? '#64748b' : '#15803d'
            }}
          >
            {miembro.estado || 'Activo'}
          </span>
        </div>

        {/* Información de Red */}
        <div style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '10px', padding: '4px 8px', borderRadius: '6px', width: '100%', textAlign: 'center', marginBottom: '8px', border: '1px solid #f1f5f9' }}>
          Directos: <strong>{hijos.length}</strong> | Red: <strong>{totalRed}</strong>
        </div>

        {/* Cifras Económicas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '4px' }}>
          
          {/* U. PROPIA (Abre Bitácora y Transacción) */}
          <div 
            style={{ 
              flex: 1, 
              backgroundColor: '#f0fdf4', 
              padding: '4px', 
              borderRadius: '6px', 
              border: '1px solid #dcfce7',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span style={{ display: 'block', fontSize: '8px', fontWeight: '700', color: '#166534' }}>U. PROPIA</span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
              {/* BOTÓN VER BITÁCORA */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!verHistorico && onOpenBitacora) {
                    onOpenBitacora(miembro);
                  }
                }}
                disabled={verHistorico}
                title={verHistorico ? '' : 'Ver Bitácora de Transacciones'}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: '10px',
                  fontWeight: '700',
                  color: utilidadPropiaVal >= 0 ? '#16a34a' : '#dc2626',
                  cursor: verHistorico ? 'default' : 'pointer',
                  textDecoration: verHistorico ? 'none' : 'underline',
                  textDecorationStyle: 'dotted'
                }}
              >
                ${utilidadPropiaVal.toLocaleString('es-CO')}
              </button>

              {/* BOTÓN AJUSTAR SALDO (+/-) */}
              {!verHistorico && onOpenTransaccion && (
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTransaccion(miembro);
                  }} 
                  title="Ajustar Saldo"
                  style={{ 
                    cursor: 'pointer', 
                    padding: '1px 3px', 
                    fontSize: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontWeight: '700',
                    color: '#475569',
                    lineHeight: '1'
                  }}
                >
                  +/-
                </button>
              )}
            </div>
          </div>

          {/* COMISIÓN TOTAL (Abre Detalle Comisión) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenDetalleComision) {
                onOpenDetalleComision(miembro);
              }
            }}
            style={{
              flex: 1,
              backgroundColor: '#eff6ff',
              border: '1px solid #dbeafe',
              borderRadius: '6px',
              padding: '4px',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <span style={{ display: 'block', fontSize: '8px', fontWeight: '700', color: '#1e40af' }}>COMISIÓN</span>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#2563eb' }}>
              ${Number(miembro.comision_total || 0).toLocaleString('es-CO')}
            </span>
          </button>
        </div>

        {/* Botón Flotante (+/-) para desplegar hijos */}
        {tieneHijos && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpandido(!expandido);
            }}
            style={{
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid #ffffff',
              backgroundColor: estiloNivel.border,
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              zIndex: 3,
              outline: 'none'
            }}
          >
            {expandido ? '−' : '+'}
          </button>
        )}
      </div>

      {/* RECURSIÓN: Renderizado de Hijos con las mismas Props */}
      {tieneHijos && expandido && (
        <div className="tree-children-container">
          {hijos.map((hijo) => (
            <div key={hijo.id} className="tree-child-item">
              <NodoArbol
                miembro={hijo}
                todosLosAfiliados={todosLosAfiliados}
                controlExpandir={controlExpandir}
                coincidenciaIds={coincidenciaIds}
                onOpenDetalleComision={onOpenDetalleComision}
                onOpenBitacora={onOpenBitacora}
                onOpenTransaccion={onOpenTransaccion}
                verHistorico={verHistorico}
                esRaiz={false}
                nivel={nivel + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NodoArbol;