// src/components/NetworkTree.jsx
import React, { useState, useEffect } from 'react';

// Función helper para limpiar tildes y minúsculas
const limpiarTexto = (texto) => 
  String(texto || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Subcomponente NodoArbol
function NodoArbol({ miembro, todosLosAfiliados, expandirTodo, coincidenciaIds }) {
  const [abierto, setAbierto] = useState(true);

  // Forzamos el estado abierto si el control global lo solicita
  useEffect(() => {
    if (expandirTodo !== null) {
      setAbierto(expandirTodo);
    }
  }, [expandirTodo]);

  // Filtrar hijos directos basándose únicamente en la lista filtrada permitida
  const hijos = todosLosAfiliados.filter(a => Number(a.id_patrocinador) === Number(miembro.id));
  const tieneHijos = hijos.length > 0;

  // Calcular la cantidad total de descendientes (Red total)
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
  
  // Resaltar la tarjeta si coincide directamente con el filtro ingresado
  const esCoincidenciaDirecta = coincidenciaIds.has(miembro.id);

  return (
    <div style={{ 
      marginLeft: '20px', 
      borderLeft: '2px solid #e2e8f0', 
      paddingLeft: '16px', 
      marginTop: '20px',
      position: 'relative'
    }}>
      {/* Tarjeta del Nodo Individual */}
      <div style={{ 
        display: 'inline-flex', 
        flexDirection: 'column',
        gap: '8px', 
        padding: '12px 16px', 
        backgroundColor: esCoincidenciaDirecta ? '#f0fdf4' : (esActivo ? '#ffffff' : '#f8fafc'), 
        borderRadius: '14px',
        border: esCoincidenciaDirecta ? '2px solid #22c55e' : (esActivo ? '1px solid #cbd5e1' : '1px solid #e2e8f0'),
        boxShadow: esCoincidenciaDirecta ? '0 0 8px rgba(34, 197, 94, 0.2)' : '0 2px 5px rgba(0,0,0,0.04)',
        transition: 'all 0.2s',
        minWidth: '320px',
        maxWidth: '520px'
      }}>
        {/* Cabecera del Nodo: ID, Nombre, Estado y Botón colapsar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Botón de Despliegue */}
            {tieneHijos ? (
              <button 
                type="button" 
                onClick={() => setAbierto(!abierto)} 
                style={{ 
                  cursor: 'pointer', 
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px', 
                  fontWeight: 'bold',
                  color: '#475569',
                  userSelect: 'none'
                }}
              >
                {abierto ? '▼' : '▶'}
              </button>
            ) : (
              <span style={{ width: '22px', height: '22px', display: 'inline-block', textAlign: 'center', color: '#94a3b8', fontSize: '10px' }}>•</span>
            )}

            {/* Badge ID */}
            <span style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
              ID {miembro.id}
            </span>

            {/* Nombre Completo */}
            <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>
              {miembro.nombre} {miembro.apellido || ''}
            </span>
          </div>

          {/* Badge Estado */}
          <span style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '10px',
            fontWeight: '700',
            backgroundColor: esActivo ? '#dcfce7' : '#f3f4f6',
            color: esActivo ? '#16a34a' : '#6b7280'
          }}>
            {miembro.estado || 'Activo'}
          </span>
        </div>

        {/* Datos de contacto y red */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
          {miembro.cedula && (
            <span>🆔 CC: <strong>{Number(miembro.cedula).toLocaleString('es-CO')}</strong></span>
          )}

          {miembro.celular && (
            <a 
              href={`https://wa.me/57${String(miembro.celular).replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
            >
              📱 {miembro.celular}
            </a>
          )}

          <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: '600', fontSize: '11px' }}>
            Nivel {miembro.nivel}
          </span>

          {tieneHijos && (
            <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: '600', fontSize: '11px' }}>
              👥 Directos: {hijos.length} | Red: {totalRed}
            </span>
          )}
        </div>

        {/* Métricas Financieras */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', marginTop: '2px' }}>
          <div>
            <span style={{ color: '#64748b' }}>U. Propia: </span>
            <strong style={{ color: (miembro.utilidad_propia || 0) >= 0 ? '#1e293b' : '#dc2626' }}>
              ${Number(miembro.utilidad_propia || 0).toLocaleString('es-CO')}
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Comisiones: </span>
            <strong style={{ color: '#2563eb' }}>
              ${Number(Math.round(miembro.comision_total || 0)).toLocaleString('es-CO')}
            </strong>
          </div>
        </div>
      </div>
      
      {/* Listado de Hijos en Cascada */}
      {tieneHijos && abierto && (
        <div style={{ marginTop: '2px' }}>
          {hijos.map(hijo => (
            <NodoArbol 
              key={hijo.id} 
              miembro={hijo} 
              todosLosAfiliados={todosLosAfiliados} 
              expandirTodo={expandirTodo} 
              coincidenciaIds={coincidenciaIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente principal de la vista
function NetworkTree({ afiliados = [] }) {
  const [filtro, setFiltro] = useState('');
  const [expandirTodo, setExpandirTodo] = useState(null);

  // Auto-expandir cuando el usuario empieza a filtrar
  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFiltro(val);
    if (val.trim() !== '') {
      setExpandirTodo(true);
    }
  };

  // 1. Identificar afiliados que coinciden directamente con la consulta (Sin tildes ni mayúsculas)
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

  // 2. Construir el conjunto de IDs visibles: ÚNICAMENTE Padre Directo + Coincidencia + Hijos Directos
  const idsVisibles = new Set(coincidenciaIds);

  if (q) {
    coincidenciaIds.forEach(idEncontrado => {
      const miembroActual = afiliados.find(a => Number(a.id) === Number(idEncontrado));

      if (miembroActual) {
        // A. Agregar a su PADRE DIRECTO (si existe)
        if (miembroActual.id_patrocinador) {
          const padreDirecto = afiliados.find(a => Number(a.id) === Number(miembroActual.id_patrocinador));
          if (padreDirecto) {
            idsVisibles.add(padreDirecto.id);
          }
        }

        // B. Agregar a sus HIJOS DIRECTOS
        const hijosDirectos = afiliados.filter(a => Number(a.id_patrocinador) === Number(miembroActual.id));
        hijosDirectos.forEach(hijo => idsVisibles.add(hijo.id));
      }
    });
  }

  // Lista final de afiliados visibles para renderizar
  const afiliadosVisibles = q 
    ? afiliados.filter(a => idsVisibles.has(a.id))
    : afiliados;

  // Identificar las raíces a renderizar
  const raices = afiliadosVisibles.filter(a => 
    !a.id_patrocinador || 
    Number(a.id_patrocinador) === 0 || 
    !afiliadosVisibles.some(p => Number(p.id) === Number(a.id_patrocinador))
  );

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '4px 0', width: '100%' }}>
      {/* Barra superior de controles del árbol */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar en la red..."
          value={filtro}
          onChange={handleFilterChange}
          style={{ 
            padding: '8px 12px',
            fontSize: '13px',
            color: '#1f2937',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            outline: 'none',
            minWidth: '240px'
          }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            type="button"
            onClick={() => setExpandirTodo(true)}
            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155' }}
          >
            📂 Expandir Todo
          </button>
          <button 
            type="button"
            onClick={() => setExpandirTodo(false)}
            style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#334155' }}
          >
            📁 Colapsar Todo
          </button>
        </div>
      </div>

      {raices.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic', paddingLeft: '8px' }}>
          {filtro ? 'No se encontraron miembros de la red con el criterio ingresado.' : 'No hay nodos raíz registrados en la red actual.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
          {raices.map(raiz => (
            <NodoArbol 
              key={raiz.id} 
              miembro={raiz} 
              todosLosAfiliados={afiliadosVisibles} 
              expandirTodo={expandirTodo} 
              coincidenciaIds={coincidenciaIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NetworkTree;