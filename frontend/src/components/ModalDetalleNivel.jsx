import React from 'react';

// Escala por defecto (1 a 4) en caso de que no se envíe `nivelesConfig`
const NIVELES_DEFAULT = [
  { nivel: 1, umbral: 50000, porcentaje_propio: 0.167 },
  { nivel: 2, umbral: 400000, porcentaje_propio: 0.333 },
  { nivel: 3, umbral: 2000000, porcentaje_propio: 0.5 },
  { nivel: 4, umbral: 6000000, porcentaje_propio: 0.667 }
];

export default function ModalDetalleNivel({ usuario, nivelesConfig = [], onClose }) {
  if (!usuario) return null;

  const utilidadPropia = Number(usuario.utilidad_propia || 0);
  const utilidadCalificacion = Number(usuario.utilidad_total_calificacion || 0);
  const utilidadRed = Math.max(0, utilidadCalificacion - utilidadPropia);
  const estaActivo = usuario.estado === 'Activo';

  // Usamos la lista provista o la escala por defecto de 4 niveles
  const listaNiveles = nivelesConfig.length > 0 ? nivelesConfig : NIVELES_DEFAULT;

  // Ordenamos niveles de menor a mayor umbral
  const nivelesOrdenados = [...listaNiveles].sort((a, b) => Number(a.nivel) - Number(b.nivel));
  
  // Nivel actual como número
  const nivelActual = Number(usuario.nivel || 0);
  
  // Obtener el nivel máximo de la estructura (ej. Nivel 4)
  const nivelMaximoEstructura = nivelesOrdenados.length > 0 
    ? Math.max(...nivelesOrdenados.map(n => Number(n.nivel))) 
    : 4;

  // Siguiente nivel por alcanzar
  const siguienteNivelConfig = nivelesOrdenados.find(n => Number(n.nivel) > nivelActual);

  // Verificación estricta de nivel máximo alcanzado
  const esNivelMaximo = nivelActual >= nivelMaximoEstructura;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '650px',
        maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        {/* Encabezado */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>
              Calificación de Nivel y Rango
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Afiliado: <strong>{usuario.nombre} {usuario.apellido || ''}</strong> (ID: {usuario.id})
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>✕</button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          
          {/* Tarjeta de Resumen del Nivel Actual */}
          <div style={{
            backgroundColor: estaActivo ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${estaActivo ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: estaActivo ? '#166534' : '#991b1b', textTransform: 'uppercase' }}>
                Estado Actual: {usuario.estado}
              </span>
              <h2 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '22px', fontWeight: '800' }}>
                {nivelActual > 0 ? `Nivel ${nivelActual}` : 'Sin Nivel (Nivel 0)'}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Puntos/Utilidad Total:</span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>
                ${utilidadCalificacion.toLocaleString('es-CO')}
              </div>
            </div>
          </div>

          {/* Desglose de "Por qué llegó a este nivel" */}
          <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '14px', fontWeight: '700' }}>
            ¿Por qué calificó en este nivel?
          </h4>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', borderRadius: '6px 0 0 6px' }}>Origen de Calificación</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Detalle</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Aporte Acumulado</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: '600', color: '#0f172a' }}>Compras Propias</td>
                <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>Utilidad Personal</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                  +${utilidadPropia.toLocaleString('es-CO')}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px', fontWeight: '600', color: '#0f172a' }}>Red Descendente</td>
                <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>
                  {usuario.compradores_en_red || 0} comprador(es) en red
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                  +${utilidadRed.toLocaleString('es-CO')}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#f8fafc', fontWeight: '700' }}>
                <td colSpan={2} style={{ padding: '10px', color: '#1e293b' }}>Total Utilidad de Calificación:</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#2563eb', fontSize: '14px' }}>
                  ${utilidadCalificacion.toLocaleString('es-CO')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Requisitos y Escala de Niveles */}
          {nivelesOrdenados.length > 0 && (
            <>
              <h4 style={{ margin: '0 0 10px 0', color: '#334155', fontSize: '14px', fontWeight: '700' }}>
                Tabla de Umbrales de Calificación
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Nivel</th>
                    <th style={{ padding: '8px 10px' }}>Umbral Requerido</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center' }}>% Propio</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {nivelesOrdenados.map((n) => {
                    const alcanzado = nivelActual >= Number(n.nivel);
                    const umbralVal = Number(n.umbral || 0);
                    const faltante = Math.max(0, umbralVal - utilidadCalificacion);

                    return (
                      <tr key={n.nivel} style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: alcanzado ? '#f0fdf4' : 'transparent'
                      }}>
                        <td style={{ padding: '8px 10px', fontWeight: '700', color: '#0f172a' }}>
                          Nivel {n.nivel}
                        </td>
                        <td style={{ padding: '8px 10px', color: '#475569' }}>
                          ${umbralVal.toLocaleString('es-CO')}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>
                          {((Number(n.porcentaje_propio) || 0) * 100).toFixed(1)}%
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600' }}>
                          {alcanzado ? (
                            <span style={{ color: '#16a34a' }}>✓ Alcanzado</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Faltan ${faltante.toLocaleString('es-CO')}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}

        </div>

        {/* Pie con sugerencia para siguiente nivel */}
        <div style={{
          padding: '14px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0',
          fontSize: '13px', color: '#475569'
        }}>
          {esNivelMaximo ? (
            <span>🏆 El afiliado ha alcanzado el <strong>Nivel Máximo</strong> de la estructura.</span>
          ) : siguienteNivelConfig ? (
            <span>
              💡 Para alcanzar el <strong>Nivel {siguienteNivelConfig.nivel}</strong> necesita acumular{' '}
              <strong>${Math.max(0, Number(siguienteNivelConfig.umbral) - utilidadCalificacion).toLocaleString('es-CO')}</strong> más en compras propias o de red.
            </span>
          ) : null}
        </div>

      </div>
    </div>
  );
}