// src/components/NetworkTree.jsx
import React, { useState } from 'react';

// Subcomponente NodoArbol optimizado
function NodoArbol({ miembro, todosLosAfiliados, expandirTodo }) {
  const [abierto, setAbierto] = useState(true);

  // Forzamos el estado abierto si el control global lo solicita
  React.useEffect(() => {
    if (expandirTodo !== null) {
      setAbierto(expandirTodo);
    }
  }, [expandirTodo]);

  // Filtrar hijos directos
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

  return (
    <div style={{ 
      marginLeft: '20px', 
      borderLeft: '2px solid #e2e8f0', 
      paddingLeft: '16px', 
      marginTop: '10px',
      position: 'relative'
    }}>
      {/* Tarjeta del Nodo Individual */}
      <div style={{ 
        display: 'inline-flex', 
        flexDirection: 'column',
        gap: '8px', 
        padding: '12px 16px', 
        backgroundColor: esActivo ? '#ffffff' : '#f8fafc', 
        borderRadius: '14px',
        border: esActivo ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
        boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
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
              href={`https://wa.me/57${miembro.celular.replace(/\D/g, '')}`} 
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
            <NodoArbol key={hijo.id} miembro={hijo} todosLosAfiliados={todosLosAfiliados} expandirTodo={expandirTodo} />
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

  // Filtrado opcional para resaltar o encontrar afiliados
  const afiliadosFiltrados = afiliados.filter(a => {
    if (!filtro.trim()) return true;
    const q = filtro.toLowerCase().trim();
    const nombreCompleto = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase();
    const cedula = String(a.cedula || '').toLowerCase();
    const celular = String(a.celular || '').toLowerCase();
    const id = String(a.id || '').toLowerCase();
    return nombreCompleto.includes(q) || cedula.includes(q) || celular.includes(q) || id.includes(q);
  });

  // Identificar los líderes raíz (sin patrocinador o con ID 0)
  const raices = afiliadosFiltrados.filter(a => !a.id_patrocinador || Number(a.id_patrocinador) === 0);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '4px 0', width: '100%' }}>
      {/* Barra superior de controles del árbol */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar en la red..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ 
            padding: '8px 12px',
            fontSize: '13px',
            color: '#1f2937',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            outline: 'none',
            minWidth: '220px'
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
            <NodoArbol key={raiz.id} miembro={raiz} todosLosAfiliados={afiliados} expandirTodo={expandirTodo} />
          ))}
        </div>
      )}
    </div>
  );
}

export default NetworkTree;