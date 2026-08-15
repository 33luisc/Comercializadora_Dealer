import React, { useState, useEffect } from 'react';

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
    <div style={{ marginLeft: esRaiz ? '10px' : '28px', position: 'relative' }}>
      
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

      {/* Fila del Nodo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justify: 'space-between',
        gap: '12px', 
        padding: esRaiz ? '12px 16px' : '9px 14px', 
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
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* BLOQUE IZQUIERDO: Flecha Destacada + ID + Avatar + Nombre + Datos Pegasus */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* BOTÓN FLECHA EXPANDIR/COLAPSAR RESALTADO */}
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
                justify: 'center',
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
            backgroundColor: '#e0e7ff', // esRaiz ? '#4f46e5' :
            color: '#3730a3', // esRaiz ? '#ffffff' :
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
            fontSize: '11px', // Ligera reducción opcional para asegurar que 2 letras quepan bien
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // Corregido: "justifyContent" en lugar de "justify"
            lineHeight: '1',
            flexShrink: 0
          }}>
            {iniciales}
          </div>

          {/* Nombre Completo y Distintivo de Padre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              fontWeight: esRaiz ? '700' : '600', 
              color: '#0f172a', 
              fontSize: esRaiz ? '15px' : '13.5px', 
              whiteSpace: 'nowrap' 
            }}>
              {miembro.nombre} {miembro.apellido || ''}
            </span>

            {esRaiz && (
              <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                LÍDER
              </span>
            )}
          </div>

          {/* Cédula */}
          {miembro.cedula && (
            <a 
              style={{ color: '#54006e', textDecoration: 'none', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}
            > <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="18" height="14" x="3" y="5" rx="2" />
              <circle cx="9" cy="11" r="2" />
              <path d="M15 11h2" />
              <path d="M15 15h2" />
              <path d="M7 17v-1a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
            </svg> {miembro.cedula}
            </a>
          )}

          {/* WhatsApp */}
          {miembro.celular && (
            <a 
              href={`https://wa.me/57${String(miembro.celular).replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}
            >
              <svg style={{ width: '14px', height: '14px', color: '#16a34a' }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg> {miembro.celular}
            </a>
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
          <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '6px', fontWeight: '600', fontSize: '11px' }}>
            Nivel {miembro.nivel}
          </span>

          {/* Métricas de Directos / Red */}
          {tieneHijos && (
            <span style={{ 
              backgroundColor: '#e0f2fe', 
              color: '#0369a1', 
              border: '1px solid #bae6fd',
              padding: '2px 7px', 
              borderRadius: '6px', 
              fontWeight: '700', 
              fontSize: '11px',
              whiteSpace: 'nowrap'
            }}>
              👥 Directos: {hijos.length} | Red: {totalRed}
            </span>
          )}
        </div>

        {/* BLOQUE DERECHO (FINANZAS): Utilidades y Comisiones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          
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
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', padding: '4px 0', width: '100%', overflowX: 'auto' }}>
      
      {/* Controles de Búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
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

      {/* Árbol */}
      {raices.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          {filtro ? 'No se encontraron miembros de la red con el criterio ingresado.' : 'No hay nodos raíz registrados.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '850px' }}>
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
  );
}

export default NetworkTree;