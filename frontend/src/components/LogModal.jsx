// src/components/LogModal.jsx
import React from 'react';

function LogModal({ verBitacora, afiliadoSeleccionadoBitacora, listaTransacciones, onClose }) {
  if (!verBitacora || !afiliadoSeleccionadoBitacora) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998, backdropFilter: 'blur(2px)' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Historial de Ventas / Ajustes</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#4b5563' }}>Mes en curso para: <strong style={{ color: '#2563eb' }}>{afiliadoSeleccionadoBitacora.nombre}</strong></p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
          {listaTransacciones.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', margin: '30px 0' }}>No hay movimientos registrados este mes.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#374151' }}>
                  <th style={{ padding: '8px 4px' }}>Concepto</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {listaTransacciones.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 4px' }}>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{t.descripcion}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{t.fecha}</div>
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', color: t.monto >= 0 ? '#16a34a' : '#dc2626' }}>
                      {t.monto >= 0 ? `+` : ''}${Number(t.monto).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <button 
            onClick={onClose} 
            style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogModal;