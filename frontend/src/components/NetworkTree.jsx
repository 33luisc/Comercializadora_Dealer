// src/components/NetworkTree.jsx
import React, { useState } from 'react';

// Subcomponente NodoArbol optimizado
function NodoArbol({ miembro, todosLosAfiliados }) {
  const [abierto, setAbierto] = useState(true);
  
  // Aseguramos la comparación correcta de tipos numéricos
  const hijos = todosLosAfiliados.filter(a => Number(a.id_patrocinador) === Number(miembro.id));
  const tieneHijos = hijos.length > 0;

  // Evaluar estado para colores discretos si fuera necesario
  const esActivo = miembro.estado === 'Activo';

  return (
    <div style={{ 
      marginLeft: '16px', 
      borderLeft: '2px dotted #e2e8f0', 
      paddingLeft: '14px', 
      marginTop: '6px',
      position: 'relative'
    }}>
      {/* Contenedor del Nodo Individual */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        padding: '8px 12px', 
        backgroundColor: '#f8fafc', 
        borderRadius: '10px',
        border: '1px solid #f1f5f9',
        transition: 'all 0.2s',
        maxWidth: 'fit-content'
      }}>
        {/* Botón de Despliegue Estilizado */}
        {tieneHijos && (
          <button 
            type="button" 
            onClick={() => setAbierto(!abierto)} 
            style={{ 
              cursor: 'pointer', 
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px', 
              fontWeight: 'bold',
              color: '#64748b',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              userSelect: 'none'
            }}
          >
            {abierto ? '▼' : '▶'}
          </button>
        )}

        {/* Información del Miembro */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'sans-serif' }}>
          {/* Badge ID */}
          <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
            ID {miembro.id}
          </span>

          {/* Nombre */}
          <span style={{ fontWeight: '600', color: '#1e293b' }}>{miembro.nombre}</span>

          {/* Badge Nivel */}
          <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
            Nivel {miembro.nivel}
          </span>

          {/* Separador */}
          <span style={{ color: '#94a3b8' }}>•</span>

          {/* Utilidad Propia Formateada */}
          <span style={{ color: '#475569', fontSize: '12px' }}>
            U. Propia: <strong style={{ color: (miembro.utilidad_propia || 0) >= 0 ? '#0f172a' : '#dc2626' }}>
              ${Number(miembro.utilidad_propia || 0).toLocaleString('es-CO')}
            </strong>
          </span>
        </div>
      </div>
      
      {/* Listado de Hijos en Cascada */}
      {tieneHijos && abierto && (
        <div style={{ marginTop: '2px' }}>
          {hijos.map(hijo => (
            <NodoArbol key={hijo.id} miembro={hijo} todosLosAfiliados={todosLosAfiliados} />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente principal de la vista
function NetworkTree({ afiliados }) {
  // Filtramos los líderes raíz (sin patrocinador o ID cero)
  const raices = afiliados.filter(a => !a.id_patrocinador || Number(a.id_patrocinador) === 0);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '4px 0' }}>
      {raices.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic', paddingLeft: '8px' }}>
          No hay nodos raíz registrados en la red actual.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {raices.map(raiz => (
            <NodoArbol key={raiz.id} miembro={raiz} todosLosAfiliados={afiliados} />
          ))}
        </div>
      )}
    </div>
  );
}

export default NetworkTree;