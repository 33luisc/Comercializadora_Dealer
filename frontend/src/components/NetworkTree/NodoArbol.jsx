// src/components/NetworkTree/NodoArbol.jsx
import React, { useState, useEffect } from 'react';

// Paleta de colores distintivos por Nivel
const PALETA_NIVELES = [
  { border: '#4f46e5', bgBadge: '#e0e7ff', textBadge: '#3730a3', bgTag: '#eef2ff' }, // Nivel 0 (Índigo)
  { border: '#2563eb', bgBadge: '#dbeafe', textBadge: '#1e40af', bgTag: '#eff6ff' }, // Nivel 1 (Azul)
  { border: '#be9200', bgBadge: '#d1fae5', textBadge: '#065f46', bgTag: '#ecfdf5' }, // Nivel 2 (Verde)
  { border: '#7c3aed', bgBadge: '#ede9fe', textBadge: '#5b21b6', bgTag: '#f5f3ff' }, // Nivel 3 (Púrpura)
  { border: '#d97706', bgBadge: '#fef3c7', textBadge: '#92400e', bgTag: '#fffbe6' }, // Nivel 4 (Naranja)
  { border: '#db2777', bgBadge: '#fce7f3', textBadge: '#9d174d', bgTag: '#fdf2f8' }, // Nivel 5 (Rosa)
  { border: '#0891b2', bgBadge: '#cffaff', textBadge: '#155e75', bgTag: '#ecfeff' }, // Nivel 6+ (Turquesa)
];

function NodoArbol({ 
  miembro, 
  todosLosAfiliados = [], 
  controlExpandir, 
  coincidenciaIds, 
  onOpenDetalleComision, 
  esRaiz = false,
  nivel = 0 
}) {
  const [expandido, setExpandido] = useState(false);

  // Escuchar cambios del objeto global controlExpandir
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

  // Obtener estilo visual según el nivel actual (se cicla si sobrepasa la paleta)
  const estiloNivel = PALETA_NIVELES[nivel % PALETA_NIVELES.length];

  // Espaciado adaptativo
  const longitudConectorHorizontal = Math.max(45, Math.round(90 - (nivel * 8)));
  const sangriaContenedorHijos = Math.max(25, Math.round(60 - (nivel * 6)));
  const separacionVertical = Math.max(12, Math.round(28 - (nivel * 4)));

  return (
    <div style={{ position: 'relative', marginTop: `${separacionVertical}px` }}>
      
      {/* Contenedor Fila del Nodo */}
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        
        {/* LÍNEA CONECTORA HORIZONTAL */}
        {!esRaiz && (
          <div 
            style={{
              position: 'absolute',
              left: `-${longitudConectorHorizontal}px`,
              top: '50%',
              width: `${longitudConectorHorizontal}px`,
              height: '1px',
              borderTop: `2px dashed ${estiloNivel.border}`,
              zIndex: 1
            }}
          />
        )}

        {/* TARJETA DEL AFILIADO */}
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            backgroundColor: esCoincidencia ? '#eff6ff' : '#ffffff',
            border: esCoincidencia ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            borderLeft: `5px solid ${estiloNivel.border}`,
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            whiteSpace: 'nowrap'
          }}
        >
          {/* Botón Expandir/Colapsar */}
          {tieneHijos ? (
            <button
              type="button"
              onClick={() => setExpandido(!expandido)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: estiloNivel.border,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none'
              }}
            >
              {expandido ? '▾' : '▸'}
            </button>
          ) : (
            <span style={{ width: '24px', textAlign: 'center', color: '#cbd5e1', fontSize: '10px' }}>
              ●
            </span>
          )}

          {/* Badge ID en el color del Nivel */}
          <span 
            style={{ 
              backgroundColor: estiloNivel.bgBadge, 
              color: estiloNivel.textBadge, 
              fontSize: '11px', 
              fontWeight: '700', 
              padding: '3px 7px', 
              borderRadius: '5px' 
            }}
          >
            #{miembro.id}
          </span>

          {/* Avatar */}
          <div 
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: estiloNivel.border,
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {iniciales}
          </div>

          {/* Nombre */}
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
            {miembro.nombre} {miembro.apellido}
          </span>

          {/* Badges */}
          {miembro.es_lider && (
            <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
              LÍDER
            </span>
          )}

          <span 
            style={{
              fontSize: '10px',
              fontWeight: '600',
              padding: '3px 8px',
              borderRadius: '10px',
              backgroundColor: miembro.estado === 'Inactivo' ? '#f1f5f9' : '#dcfce7',
              color: miembro.estado === 'Inactivo' ? '#64748b' : '#15803d'
            }}
          >
            {miembro.estado || 'Activo'}
          </span>

          {/* Tag de Nivel Resaltado */}
          <span 
            style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: estiloNivel.textBadge, 
              backgroundColor: estiloNivel.bgTag,
              padding: '3px 8px',
              borderRadius: '6px',
              border: `1px solid ${estiloNivel.border}33`
            }}
          >
            Nivel {nivel}
          </span>

          {/* Badge Red */}
          <div style={{ backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '11px', padding: '4px 10px', borderRadius: '6px' }}>
            👥 Directos: <strong>{hijos.length}</strong> | Red: <strong>{totalRed}</strong>
          </div>

          {/* U. Propia */}
          <div style={{ textAlign: 'right', marginLeft: '4px' }}>
            <span style={{ display: 'block', fontSize: '9px', fontWeight: '700', color: '#64748b' }}>U. PROPIA</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>
              ${Number(miembro.compras_mes || 0).toLocaleString()}
            </span>
          </div>

          {/* Comisiones */}
          <button
            type="button"
            onClick={() => onOpenDetalleComision && onOpenDetalleComision(miembro)}
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              padding: '3px 10px',
              cursor: 'pointer',
              textAlign: 'right'
            }}
          >
            <span style={{ display: 'block', fontSize: '9px', fontWeight: '700', color: '#16a34a' }}>COMISIONES</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb' }}>
              ➔ ${Number(miembro.comision_total || 0).toLocaleString()}
            </span>
          </button>
        </div>
      </div>

      {/* HIJOS ANIDADOS CON LÍNEA VERTICAL CON EL COLOR DEL NIVEL */}
      {tieneHijos && expandido && (
        <div 
          style={{
            marginLeft: `${sangriaContenedorHijos}px`,
            paddingLeft: `${longitudConectorHorizontal}px`,
            position: 'relative',
            borderLeft: `2px dashed ${estiloNivel.border}`,
            marginTop: '4px'
          }}
        >
          {hijos.map((hijo) => (
            <NodoArbol
              key={hijo.id}
              miembro={hijo}
              todosLosAfiliados={todosLosAfiliados}
              controlExpandir={controlExpandir}
              coincidenciaIds={coincidenciaIds}
              onOpenDetalleComision={onOpenDetalleComision}
              esRaiz={false}
              nivel={nivel + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NodoArbol;