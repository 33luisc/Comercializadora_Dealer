// src/components/TransactionModal.jsx
import React from 'react';

function TransactionModal({ modalOpen, selectedAfiliado, transData, setTransData, onClose, onSubmit }) {
  if (!modalOpen || !selectedAfiliado) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
        alignItems: 'center', justifyContenido: 'center', zIndex: 99999,
        backdropFilter: 'blur(4px)',
        // Ajuste manual por si acaso tu navegador requiere string en justifyContent
        justifyContent: 'center' 
      }}
    >
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'sans-serif' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Registrar Transacción</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>Modificar saldo para: <strong style={{ color: '#2563eb' }}>{selectedAfiliado.nombre}</strong></p>
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Monto ($)</label>
            <input 
              type="number" 
              required 
              placeholder="Ej: 1500000 o -200000" 
              value={transData.monto} 
              onChange={(e) => setTransData({...transData, monto: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', boxSizing: 'border-box' }} 
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Concepto</label>
            <input 
              type="text" 
              required 
              placeholder="Ej: Venta de Componentes" 
              value={transData.descripcion} 
              onChange={(e) => setTransData({...transData, descripcion: e.target.value})} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', boxSizing: 'border-box' }} 
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer', fontSize: '14px' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
            >
              Aplicar Ajuste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;