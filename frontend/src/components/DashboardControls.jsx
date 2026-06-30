// src/components/DashboardControls.jsx
import React from 'react';

function DashboardControls({ 
  rentabilidad, 
  vistaActiva, 
  setVistaActiva, 
  verHistorico, 
  setVerHistorico, 
  periodoCierre, 
  setPeriodoCierre, 
  onCierreMes, 
  onCargarPeriodoHistorico, 
  onCargarDatos 
}) {
  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif', marginBottom: '16px' }}>
      
      {/* TARJETAS DE MÉTRICAS - FORZADAS A COLUMNAS HORIZONTALES SIN BORDES NEGROS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px', 
        marginBottom: '20px' 
      }}>
        
        {/* Tarjeta 1 */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.05em' }}>Utilidad Bruta</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWayne: 'bold', color: '#030712' }}>${Number(rentabilidad.utilidadGlobal || 0).toLocaleString()}</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '12px', display: 'flex' }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.05em' }}>Comisiones</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWayne: 'bold', color: '#dc2626' }}>${Number(rentabilidad.comisionesPagadas || 0).toLocaleString()}</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '12px', display: 'flex' }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.05em' }}>Margen Neto</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWayne: 'bold', color: '#16a34a' }}>${Number(rentabilidad.margenLibre || 0).toLocaleString()}</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '12px', display: 'flex' }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
        </div>

        {/* Tarjeta 4 */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', tracking: '0.05em' }}>Payout Red</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWayne: 'bold', color: '#9333ea' }}>{rentabilidad.porcentajeRepartido || 0}%</p>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#faf5ff', color: '#9333ea', borderRadius: '12px', display: 'flex' }}>
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
          </div>
        </div>

      </div>

      {/* ACCIONES Y PERIODO CONTABLE */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '12px', 
        backgroundColor: '#ffffff', 
        padding: '12px', 
        borderRadius: '16px', 
        border: '1px solid #f3f4f6' 
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Pastillas de navegación */}
          <div style={{ backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
            <button 
              type="button"
              onClick={() => { setVistaActiva('tabla'); setVerHistorico(false); }}
              style={{ border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', backgroundColor: (vistaActiva === 'tabla' && !verHistorico) ? '#ffffff' : 'transparent', color: (vistaActiva === 'tabla' && !verHistorico) ? '#030712' : '#6b7280', boxShadow: (vistaActiva === 'tabla' && !verHistorico) ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
            >
              📋 Vista Tabla
            </button>
            <button 
              type="button"
              onClick={() => { setVistaActiva('arbol'); setVerHistorico(false); }}
              style={{ border: 'none', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', backgroundColor: (vistaActiva === 'arbol' && !verHistorico) ? '#ffffff' : 'transparent', color: (vistaActiva === 'arbol' && !verHistorico) ? '#030712' : '#6b7280', boxShadow: (vistaActiva === 'arbol' && !verHistorico) ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
            >
              🌿 Organigrama (Árbol)
            </button>
          </div>

          {/* Input de Fecha minimalista */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '6px 12px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>Mes:</span>
            <input 
              type="month" 
              value={periodoCierre} 
              onChange={(e) => {
                setPeriodoCierre(e.target.value);
                if (verHistorico) onCargarPeriodoHistorico(e.target.value);
              }} 
              style={{ border: 'none', backgroundColor: 'transparent', fontWeight: 'bold', fontSize: '12px', color: '#374151', outline: 'none', cursor: 'pointer' }} 
            />
          </div>

          {/* Botón de Historial */}
          {verHistorico ? (
            <button 
              type="button"
              onClick={() => { setVerHistorico(false); onCargarDatos(); }} 
              style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer' }}
            >
              👀 Ver Mes Activo
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => onCargarPeriodoHistorico(periodoCierre)} 
              style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#4b5563', fontSize: '12px', fontWeight: '600', padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              🔍 Consultar Historial
            </button>
          )}
        </div>

        {/* Botón de Cierre */}
        {!verHistorico && (
          <button 
            type="button"
            onClick={onCierreMes}
            style={{ backgroundColor: '#dc2626', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            🔒 Ejecutar Cierre de Mes
          </button>
        )}

      </div>
    </div>
  );
}

export default DashboardControls;