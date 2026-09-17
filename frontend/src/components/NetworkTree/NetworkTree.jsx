// src/components/NetworkTree/NetworkTree.jsx
import React, { useState } from 'react';
import NodoArbol from './NodoArbol';
import { useDragScroll } from './useDragScroll';
import { limpiarTexto } from './utils/treeHelpers';

function NetworkTree({ 
  afiliados = [], 
  onOpenDetalleComision, 
  onOpenBitacora, 
  onOpenTransaccion, 
  verHistorico = false 
}) {
  const [filtro, setFiltro] = useState('');
  
  // Usamos un objeto con timestamp para asegurar que el efecto React detecte siempre los clics
  const [controlExpandir, setControlExpandir] = useState({ expandir: false, timestamp: Date.now() });

  const { containerRef, isMouseDown, dragHandlers } = useDragScroll();

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFiltro(val);
    if (val.trim() !== '') {
      setControlExpandir({ expandir: true, timestamp: Date.now() });
    }
  };

  const handleExpandirTodo = () => {
    setControlExpandir({ expandir: true, timestamp: Date.now() });
  };

  const handleColapsarTodo = () => {
    setControlExpandir({ expandir: false, timestamp: Date.now() });
  };

  // Coincidencias de búsqueda
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
      
      {/* Controles de Búsqueda y Botones Globales */}
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
            onClick={handleExpandirTodo}
            style={{ padding: '8px 14px', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            Expandir Todo
          </button>
          <button 
            type="button"
            onClick={handleColapsarTodo}
            style={{ padding: '8px 14px', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            Colapsar Todo
          </button>
        </div>
      </div>

      {/* Contenedor deslizable horizontalmente */}
      <div 
        ref={containerRef}
        {...dragHandlers}
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
          <div className="tree-container">
            {raices.map(raiz => (
                <NodoArbol 
                key={raiz.id} 
                miembro={raiz} 
                todosLosAfiliados={afiliados} 
                controlExpandir={controlExpandir}
                coincidenciaIds={coincidenciaIds}
                onOpenDetalleComision={onOpenDetalleComision}
                onOpenBitacora={onOpenBitacora}
                onOpenTransaccion={onOpenTransaccion}
                verHistorico={verHistorico}
                esRaiz={true}
                nivel={0}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default NetworkTree;