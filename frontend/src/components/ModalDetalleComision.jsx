import React from 'react';

export default function ModalDetalleComision({ usuario, onClose }) {
  if (!usuario) return null;

  const desglose = usuario.desglose_comisiones || [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
      }}>
        {/* Encabezado */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>
              Desglose de Comisiones
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
              Afiliado: <strong>{usuario.nombre} {usuario.apellido || ''}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#64748b',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {desglose.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>
              Este afiliado no tiene aportes registrados a su comisión.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px', borderRadius: '6px 0 0 6px' }}>Origen (Persona)</th>
                  <th style={{ padding: '10px' }}>Concepto</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>%</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Aporte</th>
                </tr>
              </thead>
              <tbody>
                {desglose.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#0f172a' }}>
                      {item.nombre_origen}
                    </td>
                    <td style={{ padding: '10px', color: '#475569' }}>
                      <span style={{
                        backgroundColor: item.tipo.includes('Propia') ? '#dcfce7' : '#dbeafe',
                        color: item.tipo.includes('Propia') ? '#166534' : '#1e40af',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {item.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>
                      {item.porcentaje}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                      +${Number(Math.round(item.monto)).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Resumen Total al Pie */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#475569' }}>Comisión Total Generada:</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
            ${Number(Math.round(usuario.comision_total || 0)).toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </div>
  );
}