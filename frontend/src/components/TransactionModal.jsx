// src/components/TransactionModal.jsx
import React from 'react';

function TransactionModal({ modalOpen, selectedAfiliado, transData, setTransData, onClose, onSubmit }) {
  if (!modalOpen || !selectedAfiliado) return null;

  // Formatea un número o string numérico a formato moneda COP ($ 1.500.000)
  const formatCOP = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    if (val === '-') return '-';

    const numericValue = Number(val);
    if (isNaN(numericValue)) return '';

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(numericValue);
  };

  // Manejador del input de Monto
  const handleMontoChange = (e) => {
    const inputValue = e.target.value;

    // Si borra todo, resetea a string vacío
    if (!inputValue) {
      setTransData({ ...transData, monto: '' });
      return;
    }

    // Permite iniciar con un signo menos (-) para transacciones negativas
    if (inputValue === '-') {
      setTransData({ ...transData, monto: '-' });
      return;
    }

    // Extrae únicamente los dígitos numéricos y el signo menos si existe al inicio
    const isNegative = inputValue.startsWith('-');
    const cleanNumbers = inputValue.replace(/\D/g, '');

    if (cleanNumbers === '') {
      setTransData({ ...transData, monto: '' });
      return;
    }

    // Guarda SOLO el número puro en el estado (ej: "2000000" o "-2000000")
    const rawNumericValue = isNegative ? `-${cleanNumbers}` : cleanNumbers;
    setTransData({ ...transData, monto: rawNumericValue });
  };

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 99999,
        backdropFilter: 'blur(4px)'
      }}
    >
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'sans-serif' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Registrar Transacción</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>Modificar saldo para: <strong style={{ color: '#2563eb' }}>{selectedAfiliado.nombre}</strong></p>
        
        <form onSubmit={onSubmit}>
          {/* CAMPO MONTO */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>
              Monto ($ COP)
            </label>
            <input 
              type="text" 
              required 
              placeholder="Ej: $ 1.500.000 o -$ 200.000" 
              value={formatCOP(transData.monto)} 
              onChange={handleMontoChange} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', boxSizing: 'border-box' }} 
            />
          </div>

          {/* CAMPO CONCEPTO / DESCRIPCIÓN */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>
              Concepto
            </label>
            <input 
              type="text" 
              required 
              minLength={4}
              title="La descripción debe tener al menos 4 caracteres."
              placeholder="Ej: Venta de Componentes" 
              value={transData.descripcion || 'Venta'} // <--- Usar el valor por defecto si está vacío
              onChange={(e) => setTransData({ ...transData, descripcion: e.target.value })} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', boxSizing: 'border-box' }} 
            />
            <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
              Mínimo 4 caracteres.
            </span>
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