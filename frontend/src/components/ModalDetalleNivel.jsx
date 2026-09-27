import React from 'react';

// Configuración por defecto si no se pasa nivelesConfig
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

  // 1. Si viene el arreglo directo de compradores_descendientes lo usamos
  // 2. Si no, construimos la lista única agrupando las ventas por usuario desde desglose_comisiones
  let listaAportesRed = [];

  if (usuario.compradores_descendientes && usuario.compradores_descendientes.length > 0) {
    listaAportesRed = usuario.compradores_descendientes.map(item => ({
      id: item.id,
      nombre: item.nombre,
      concepto: 'Compra en Red',
      monto: Number(item.aporte_compra || 0)
    }));
  } else {
    // Agrupar por ID único de origen para evitar duplicados por tipo de bono/comisión
    const mapaUnico = {};
    (usuario.desglose_comisiones || []).forEach(item => {
      const esPropia = item.tipo?.toLowerCase().includes('propia') || String(item.origen_id) === String(usuario.id);
      if (!esPropia && item.origen_id) {
        if (!mapaUnico[item.origen_id]) {
          mapaUnico[item.origen_id] = {
            id: item.origen_id,
            nombre: item.nombre_origen,
            concepto: item.tipo,
            monto: Number(item.utilidad_origen || item.monto || 0)
          };
        }
      }
    });
    listaAportesRed = Object.values(mapaUnico);
  }

  // Suma total de los ítems en la tabla
  const sumaTotalLista = listaAportesRed.reduce((acc, curr) => acc + curr.monto, 0);

  // Configuración de niveles
  const listaNiveles = nivelesConfig.length > 0 ? nivelesConfig : NIVELES_DEFAULT;
  const nivelesOrdenados = [...listaNiveles].sort((a, b) => Number(a.nivel) - Number(b.nivel));
  
  const nivelActual = Number(usuario.nivel || 0);
  const nivelMaximoEstructura = nivelesOrdenados.length > 0 
    ? Math.max(...nivelesOrdenados.map(n => Number(n.nivel))) 
    : 4;

  const siguienteNivelConfig = nivelesOrdenados.find(n => Number(n.nivel) > nivelActual);
  const esNivelMaximo = nivelActual >= nivelMaximoEstructura;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '720px',
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
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
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}
          >
            ✕
          </button>
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
            justify: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: estaActivo ? '#166534' : '#991b1b', 
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}>
                Estado Actual: {usuario.estado}
              </span>
              <h2 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '22px', fontWeight: '800', whiteSpace: 'nowrap' }}>
                {nivelActual > 0 ? `Nivel ${nivelActual}` : 'Sin Nivel (Nivel 0)'}
              </h2>
            </div>
            <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
              <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                Puntos/Utilidad Total:
              </span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb', whiteSpace: 'nowrap' }}>
                ${utilidadCalificacion.toLocaleString('es-CO')}
              </div>
            </div>
          </div>

          {/* Resumen Principal de Calificación */}
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
                  {usuario.compradores_en_red || listaAportesRed.length || 0} comprador(es) en red
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

          {/* Detalle de Aportes de la Red Descendente */}
          {listaAportesRed.length > 0 && (
            <div style={{
              marginBottom: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>
                DETALLE DE APORTES DE LA RED DESCENDENTE ({listaAportesRed.length} COMPRADORES)
              </h5>
              
              {/* Contenedor con Scroll para recorrer toda la red */}
              <div style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '6px' }}>ID</th>
                      <th style={{ padding: '6px' }}>Persona</th>
                      <th style={{ padding: '6px' }}>Concepto</th>
                      <th style={{ padding: '6px', textAlign: 'right' }}>Aporte de Compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaAportesRed.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px', color: '#64748b' }}>{item.id}</td>
                        <td style={{ padding: '6px', fontWeight: '600', color: '#0f172a' }}>{item.nombre}</td>
                        <td style={{ padding: '6px', color: '#475569' }}>
                          <span style={{
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: '500'
                          }}>
                            {item.concepto}
                          </span>
                        </td>
                        <td style={{ padding: '6px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                          +${Number(Math.round(item.monto)).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#e2e8f0', fontWeight: '700' }}>
                      <td colSpan={3} style={{ padding: '6px', color: '#0f172a' }}>Suma de Aportes de Red:</td>
                      <td style={{ padding: '6px', textAlign: 'right', color: '#16a34a' }}>
                        +${sumaTotalLista.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Tabla de Umbrales de Calificación */}
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

        {/* Pie con Estado / Meta Siguiente Nivel */}
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