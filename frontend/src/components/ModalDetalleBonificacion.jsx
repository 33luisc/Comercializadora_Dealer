// src/components/ModalDetalleBonificacion.jsx
import React from 'react';

export default function ModalDetalleBonificacion({ listaUsuarios = [], rentabilidad, onClose }) {
  if (!listaUsuarios) return null;

  // Normalizamos para manejar tanto un objeto individual como un array
  const usuariosRaw = Array.isArray(listaUsuarios) ? listaUsuarios : [listaUsuarios];

  // Helper para identificar bonos excluyendo diferenciales
  const esBonificacion = (concepto) => {
    if (!concepto) return false;
    const c = String(concepto).toLowerCase();
    return !c.includes('diferencial') && (c.includes('liderazgo') || c.includes('bono') || c.includes('bonificación'));
  };

  // 1. Agrupamos los datos por usuario con sus desgloses y subtotal
  const usuariosProcesados = usuariosRaw.map((u) => {
    const desglose = u.desglose_comisiones || u.desglose || u.detalles || [];
    const bonosFiltrados = desglose.filter((item) => esBonificacion(item.tipo || item.concepto));
    
    const nombreUsuario = `${u.nombre || ''} ${u.apellido || ''}`.trim() || u.nombre_origen || u.origen || 'Usuario';

    let items = [];
    let subtotal = 0;

    if (bonosFiltrados.length > 0) {
      items = bonosFiltrados.map((item) => ({
        origen: item.nombre_origen || item.origen || nombreUsuario,
        concepto: item.tipo || item.concepto || 'Bono Liderazgo',
        monto: Number(item.monto || item.aporte || 0)
      }));
      subtotal = items.reduce((acc, item) => acc + item.monto, 0);
    } else {
      // Fallback para monto directo si no hay desglose array
      const montoDirecto = Number(u.bono_liderazgo || u.bonificacion || 0);
      if (montoDirecto > 0) {
        items = [{
          origen: u.nombre_origen || nombreUsuario,
          concepto: 'Bono Liderazgo (Red)',
          monto: montoDirecto
        }];
        subtotal = montoDirecto;
      }
    }

    return {
      nombreUsuario,
      items,
      subtotal
    };
  }).filter((u) => u.subtotal > 0 || u.items.length > 0);

  // 2. Calculamos el total global
  const totalGlobal = rentabilidad?.bonificacionesPagadas ?? 
    usuariosProcesados.reduce((sum, u) => sum + u.subtotal, 0);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '700px',
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
              Desglose de Bonificaciones
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Detalle exclusivo de bonos de liderazgo generados por la red
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}>✕</button>
        </div>

        {/* Cuerpo / Tabla con Subtotales */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {usuariosProcesados.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
              No se encontraron registros de bonificaciones en la lista seleccionada.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Origen (Persona)</th>
                  <th style={{ padding: '10px' }}>Concepto</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Aporte</th>
                </tr>
              </thead>
              <tbody>
                {usuariosProcesados.map((u, uIdx) => (
                  <React.Fragment key={uIdx}>
                    {/* Filas de ítems individuales del usuario */}
                    {u.items.map((item, itemIdx) => (
                      <tr key={itemIdx} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '8px 10px', color: '#334155' }}>{item.origen}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{
                            backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px',
                            borderRadius: '12px', fontSize: '11px', fontWeight: '600'
                          }}>
                            {item.concepto}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                          +${Math.round(item.monto).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    ))}

                    {/* Fila del Subtotal del usuario */}
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <td colSpan={2} style={{ padding: '8px 10px', fontWeight: '700', color: '#1e293b' }}>
                        Subtotal para {u.nombreUsuario}:
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                        ${Math.round(u.subtotal).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Total Global al Pie */}
        <div style={{
          padding: '16px 20px', backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontWeight: '700', color: '#334155' }}>Total Bonificaciones:</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#2563eb' }}>
            ${Math.round(totalGlobal).toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </div>
  );
}