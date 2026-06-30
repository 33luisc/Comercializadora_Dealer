// src/components/NetworkTree.jsx
import React, { useState } from 'react';

// Subcomponente NodoArbol que ya tenías abajo en tu archivo original
function NodoArbol({ miembro, todosLosAfiliados }) {
  const [abierto, setAbierto] = useState(true);
  const hijos = todosLosAfiliados.filter(a => Number(a.id_patrocinador) === Number(miembro.id));
  const tieneHijos = hijos.length > 0;

  return (
    <div style={{ marginLeft: '20px', borderLeft: '1px dashed #cbd5e1', paddingLeft: '10px', marginTop: '5px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
        {tieneHijos && (
          <button 
            type="button" 
            onClick={() => setAbierto(!abierto)} 
            style={{ cursor: 'pointer', padding: '0 4px', fontSize: '12px', fontWeight: 'bold' }}
          >
            {abierto ? '[-]' : '[+]'}
          </button>
        )}
        <span style={{ fontSize: '13px', fontWeight: '500' }}>
          <strong>{miembro.nombre}</strong> (ID: {miembro.id}) - Nivel {miembro.nivel} — U. Propia: {miembro.utilidad_propia}
        </span>
      </div>
      
      {tieneHijos && abierto && (
        <div>
          {hijos.map(hijo => (
            <NodoArbol key={hijo.id} miembro={hijo} todosLosAfiliados={todosLosAfiliados} />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente principal del archivo
function NetworkTree({ afiliados }) {
  // Filtramos los que son líderes raíz
  const raices = afiliados.filter(a => !a.id_patrocinador || Number(a.id_patrocinador) === 0);

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
        Estructura Jerárquica de la Red
      </h3>
      {raices.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>No hay nodos raíz en la red.</p>
      ) : (
        raices.map(raiz => (
          <NodoArbol key={raiz.id} miembro={raiz} todosLosAfiliados={afiliados} />
        ))
      )}
    </div>
  );
}

export default NetworkTree;