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
  
  // Objeto con timestamp para asegurar que el efecto React detecte siempre los clics de expansión/colapso
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

  // 1. Identificar coincidencia principal (Nodo buscado)
  const coincidenciaIds = new Set();
  const terminoOriginal = filtro.trim();

  if (terminoOriginal) {
    if (terminoOriginal.startsWith('#')) {
      // CASO 1: Búsqueda exacta por ID usando "#"
      const idBuscado = terminoOriginal.substring(1).trim();

      if (idBuscado) {
        afiliados.forEach(a => {
          if (String(a.id) === idBuscado) {
            coincidenciaIds.add(a.id);
          }
        });
      }
    } else {
      // CASO 2: Búsqueda tradicional por Nombre, Cédula o Celular
      const q = limpiarTexto(terminoOriginal);

      afiliados.forEach(a => {
        const nombreCompleto = limpiarTexto(`${a.nombre || ''} ${a.apellido || ''}`);
        const cedula = limpiarTexto(a.cedula);
        const celular = limpiarTexto(a.celular);

        if (nombreCompleto.includes(q) || cedula.includes(q) || celular.includes(q)) {
          coincidenciaIds.add(a.id);
        }
      });
    }
  }

  // 2. Construir la vista enfocada (Nodo + Padres + Hijos directos)
  const idsVisibles = new Set(coincidenciaIds);

  if (terminoOriginal && coincidenciaIds.size > 0) {
    coincidenciaIds.forEach(idEncontrado => {
      const miembroActual = afiliados.find(a => Number(a.id) === Number(idEncontrado));

      if (miembroActual) {
        // A. Recorrer la cadena de ascendientes hacia arriba hasta la raíz
        let idPadre = miembroActual.id_patrocinador;
        while (idPadre && Number(idPadre) !== 0) {
          const padre = afiliados.find(a => Number(a.id) === Number(idPadre));
          if (padre) {
            idsVisibles.add(padre.id);
            idPadre = padre.id_patrocinador;
          } else {
            break;
          }
        }

        // B. Agregar solo sus hijos directos
        const hijosDirectos = afiliados.filter(a => Number(a.id_patrocinador) === Number(miembroActual.id));
        hijosDirectos.forEach(hijo => idsVisibles.add(hijo.id));
      }
    });
  }

  // Lista de afiliados que se van a dibujar
  const afiliadosVisibles = terminoOriginal 
    ? afiliados.filter(a => idsVisibles.has(a.id))
    : afiliados;

  // Raíces del árbol a renderizar
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
            placeholder="Buscar por nombre, CC o #ID (ej. #1)..."
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
                todosLosAfiliados={afiliadosVisibles} 
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