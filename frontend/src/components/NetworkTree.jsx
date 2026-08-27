import React, { useState, useEffect, useRef } from 'react';

// Función helper para limpiar tildes y minúsculas
const limpiarTexto = (texto) => 
  String(texto || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Subcomponente NodoArbol
function NodoArbol({ miembro, todosLosAfiliados, expandirTodo, coincidenciaIds, onOpenDetalleComision, esRaiz = false }) {
  const [abierto, setAbierto] = useState(true);

  useEffect(() => {
    if (expandirTodo !== null) {
      setAbierto(expandirTodo);
    }
  }, [expandirTodo]);

  const hijos = todosLosAfiliados.filter(a => Number(a.id_patrocinador) === Number(miembro.id));
  const tieneHijos = hijos.length > 0;

  const contarDescendientes = (idPatrocinador) => {
    const directos = todosLosAfiliados.filter(a => Number(a.id_patrocinador) === Number(idPatrocinador));
    let total = directos.length;
    directos.forEach(h => {
      total += contarDescendientes(h.id);
    });
    return total;
  };

  const totalRed = contarDescendientes(miembro.id);
  const esActivo = miembro.estado === 'Activo';
  const esCoincidenciaDirecta = coincidenciaIds.has(miembro.id);

  // Iniciales del Avatar
  const iniciales = `${miembro.nombre?.[0] || ''}${miembro.apellido?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div style={{ marginLeft: esRaiz ? '0px' : '28px', position: 'relative' }}>
      
      {/* LÍNEAS CONECTORAS TIPO ÁRBOL (Solo para hijos) */}
      {!esRaiz && (
        <>
          {/* Línea vertical principal */}
          <div style={{
            position: 'absolute',
            left: '-18px',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: '#cbd5e1'
          }} />

          {/* Codo horizontal hacia la tarjeta */}
          <div style={{
            position: 'absolute',
            left: '-18px',
            top: '24px',
            width: '16px',
            height: '2px',
            backgroundColor: '#cbd5e1'
          }} />
        </>
      )}

      {/* Fila del Nodo - inline-flex para que NO ocupe todo el ancho de la pantalla */}
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: esRaiz ? '10px 16px' : '8px 14px', 
        marginTop: '8px',
        backgroundColor: esCoincidenciaDirecta 
          ? '#f0fdf4' 
          : (esRaiz ? '#ffffff' : '#fafafa'), 
        borderRadius: '12px',
        border: esCoincidenciaDirecta 
          ? '2px solid #22c55e' 
          : (esRaiz ? '1.5px solid #6366f1' : '1px solid #e2e8f0'),
        boxShadow: esRaiz 
          ? '0 4px 12px rgba(99, 102, 241, 0.08)' 
          : '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.15s ease',
        boxSizing: 'border-box'
      }}>
        
        {/* BOTÓN FLECHA EXPANDIR/COLAPSAR */}
        {tieneHijos ? (
          <button 
            type="button" 
            onClick={() => setAbierto(!abierto)} 
            title={abierto ? "Colapsar descendientes" : "Expandir descendientes"}
            style={{ 
              cursor: 'pointer', 
              background: abierto ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#ffffff',
              border: abierto ? 'none' : '2px solid #6366f1',
              borderRadius: '8px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: abierto ? '#ffffff' : '#6366f1',
              boxShadow: '0 2px 5px rgba(99, 102, 241, 0.25)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <svg 
              style={{ 
                width: '14px', 
                height: '14px', 
                transform: abierto ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span style={{ width: '28px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%' }} />
          </span>
        )}

        {/* Badge ID */}
        <span style={{ 
          backgroundColor: '#e0e7ff',
          color: '#3730a3',
          padding: '3px 8px', 
          borderRadius: '6px', 
          fontSize: '11px', 
          fontWeight: '800',
          flexShrink: 0
        }}>
          #{miembro.id}
        </span>

        {/* Avatar con Iniciales */}
        <div style={{
          width: esRaiz ? '30px' : '26px',
          height: esRaiz ? '30px' : '26px',
          borderRadius: '50%',
          backgroundColor: esRaiz ? '#2563eb' : (esActivo ? '#3b82f6' : '#94a3b8'),
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: '1',
          flexShrink: 0
        }}>
          {iniciales}
        </div>

        {/* Nombre Completo */}
        <span style={{ 
          fontWeight: esRaiz ? '700' : '600', 
          color: '#0f172a', 
          fontSize: esRaiz ? '15px' : '13.5px', 
          whiteSpace: 'nowrap' 
        }}>
          {miembro.nombre} {miembro.apellido || ''}
        </span>

        {/* Tag LÍDER */}
        {esRaiz && (
          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
            LÍDER
          </span>
        )}

        {/* Estado */}
        <span style={{
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '700',
          backgroundColor: esActivo ? '#dcfce7' : '#f1f5f9',
          color: esActivo ? '#15803d' : '#64748b',
          border: `1px solid ${esActivo ? '#86efac' : '#e2e8f0'}`
        }}>
          {miembro.estado || 'Activo'}
        </span>

        {/* Nivel */}
        <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '6px', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap' }}>
          Nivel {miembro.nivel}
        </span>

        {/* Métricas Directos y Red */}
        {tieneHijos && (
          <span style={{ 
            backgroundColor: '#e0f2fe', 
            color: '#0369a1', 
            border: '1px solid #bae6fd',
            padding: '3px 8px', 
            borderRadius: '6px', 
            fontWeight: '700', 
            fontSize: '11px',
            whiteSpace: 'nowrap'
          }}>
            👥 Directos: {hijos.length} | Red: {totalRed}
          </span>
        )}

        {/* BLOQUE FINANCIERO (Junto al cuadro de directos) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '12px', flexShrink: 0 }}>
          
          {/* Utilidad Propia */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>U. Propia</span>
            <strong style={{ color: (miembro.utilidad_propia || 0) >= 0 ? '#16a34a' : '#dc2626', fontSize: '13px' }}>
              ${Number(miembro.utilidad_propia || 0).toLocaleString('es-CO')}
            </strong>
          </div>

          {/* Comisiones Botón */}
          <div style={{ 
            backgroundColor: '#eff6ff', 
            padding: '5px 12px', 
            borderRadius: '8px', 
            border: '1px solid #bfdbfe',
            textAlign: 'right'
          }}>
            <span style={{ color: '#1e40af', fontSize: '10px', textTransform: 'uppercase', fontWeight: '800', display: 'block' }}>Comisiones</span>
            <button
              type="button"
              onClick={() => onOpenDetalleComision?.(miembro)}
              title="Ver desglose de comisiones"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                font: 'inherit',
                fontWeight: '800',
                fontSize: '13px',
                color: '#2563eb',
                cursor: 'pointer'
              }}
            >
              ➔ ${Number(Math.round(miembro.comision_total || 0)).toLocaleString('es-CO')} 
            </button>
          </div>

        </div>

      </div>

      {/* Renderizado en Cascada de los Hijos */}
      {tieneHijos && abierto && (
        <div style={{ position: 'relative' }}>
          {hijos.map(hijo => (
            <NodoArbol 
              key={hijo.id} 
              miembro={hijo} 
              todosLosAfiliados={todosLosAfiliados} 
              expandirTodo={expandirTodo} 
              coincidenciaIds={coincidenciaIds}
              onOpenDetalleComision={onOpenDetalleComision}
              esRaiz={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente principal de la vista
function NetworkTree({ afiliados = [], onOpenDetalleComision }) {
  const [filtro, setFiltro] = useState('');
  const [expandirTodo, setExpandirTodo] = useState(null);

  // Referencias y estados para el desplazamiento por arrastre (drag-to-scroll)
  const treeContainerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (['BUTTON', 'INPUT', 'SVG', 'PATH'].includes(e.target.tagName)) return;
    setIsMouseDown(true);
    setStartX(e.pageX - treeContainerRef.current.offsetLeft);
    setScrollLeft(treeContainerRef.current.scrollLeft);
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
    const x = e.pageX - treeContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    treeContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFiltro(val);
    if (val.trim() !== '') {
      setExpandirTodo(true);
    }
  };

  const coincidenciaIds = new Set();
  const q = limpiarTexto(filtro.trim());

  if (q) {
    afiliados.forEach(a => {
      const nombreCompleto = limpiarTexto(`${a.nombre || ''} ${a.apellido || ''}`);
      const cedula = limpiarTexto(a.cedula);
      const celular = limpiarTexto(a.celular);
      const id = limpiarTexto(a.id);

      if (nombreCompleto.includes(q) || cedula.includes(q) || celular.includes(q) || id.includes(q)) {
        coincidenciaIds.add(a.id);
      }
    });
  }

  const idsVisibles = new Set(coincidenciaIds);

  if (q) {
    coincidenciaIds.forEach(idEncontrado => {
      const miembroActual = afiliados.find(a => Number(a.id) === Number(idEncontrado));

      if (miembroActual) {
        if (miembroActual.id_patrocinador) {
          const padreDirecto = afiliados.find(a => Number(a.id) === Number(miembroActual.id_patrocinador));
          if (padreDirecto) {
            idsVisibles.add(padreDirecto.id);
          }
        }
        const hijosDirectos = afiliados.filter(a => Number(a.id_patrocinador) === Number(miembroActual.id));
        hijosDirectos.forEach(hijo => idsVisibles.add(hijo.id));
      }
    });
  }

  const afiliadosVisibles = q 
    ? afiliados.filter(a => idsVisibles.has(a.id))
    : afiliados;

  const raices = afiliadosVisibles.filter(a => 
    !a.id_patrocinador || 
    Number(a.id_patrocinador) === 0 || 
    !afiliadosVisibles.some(p => Number(p.id) === Number(a.id_patrocinador))
  );

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: '4px 0', width: '100%' }}>
      
      {/* Controles de Búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '28px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
          <input 
            type="text" 
            placeholder="Buscar en la red por nombre, CC o ID..."
            value={filtro}
            onChange={handleFilterChange}
            style={{ 
              width: '100%',
              padding: '9px 12px 9px 36px',
              fontSize: '13px',
              color: '#0f172a',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <svg 
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b' }} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button"
            onClick={() => setExpandirTodo(true)}
            style={{ padding: '8px 14px', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            Expandir Todo
          </button>
          <button 
            type="button"
            onClick={() => setExpandirTodo(false)}
            style={{ padding: '8px 14px', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            Colapsar Todo
          </button>
        </div>
      </div>

      {/* Contenedor deslizable horizontalmente con ratón y scrollbar */}
      <div 
        ref={treeContainerRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ 
          overflowX: 'auto', 
          width: '100%', 
          cursor: isMouseDown ? 'grabbing' : 'grab',
          userSelect: 'none',
          paddingBottom: '16px'
        }}
      >
        {raices.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            {filtro ? 'No se encontraron miembros de la red con el criterio ingresado.' : 'No hay nodos raíz registrados.'}
          </div>
        ) : (
          <div style={{ display: 'inline-block', minWidth: '100%', paddingRight: '20px', boxSizing: 'border-box' }}>
            {raices.map(raiz => (
              <NodoArbol 
                key={raiz.id} 
                miembro={raiz} 
                todosLosAfiliados={afiliadosVisibles} 
                expandirTodo={expandirTodo} 
                coincidenciaIds={coincidenciaIds}
                onOpenDetalleComision={onOpenDetalleComision}
                esRaiz={true}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default NetworkTree;