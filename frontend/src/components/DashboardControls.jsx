// src/components/DashboardControls.jsx
import React from 'react';
import { exportarAExcel, exportarAPDF } from '../utils/exportHelpers';

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
  onCargarDatos,
  datosHistoricos = []
}) {
  // Obtener el mes actual en formato YYYY-MM para restricciones de entrada
  const hoy = new Date();
  const mesActualStr = hoy.toISOString().slice(0, 7);

  // Validación: ¿El período seleccionado es un mes futuro?
  const esMesFuturo = periodoCierre > mesActualStr;

  // Manejador seguro para ejecutar el cierre
  const handleEjecutarCierre = () => {
    if (esMesFuturo) {
      alert("⚠️ No puedes ejecutar el cierre de un mes futuro.");
      return;
    }

    const confirmacion = window.confirm(
      `⚠️ ¿Estás seguro de congelar los datos para el período [${periodoCierre}]?\n\nEsta acción creará la foto histórica correspondiente.`
    );

    if (confirmacion && onCierreMes) {
      onCierreMes();
    }
  };

  return (
    <div style={{ width: '100%', fontFamily: 'sans-serif', marginBottom: '16px' }}>
      
      {/* TARJETAS DE MÉTRICAS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '12px', 
        marginBottom: '16px' 
      }}>
        
        {/* Tarjeta 1 */}
        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Utilidad Bruta</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#030712' }}>
              ${Number(rentabilidad?.utilidadGlobal || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '10px', display: 'flex' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
        </div>

        {/* Tarjeta 2: Comisiones */}
        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Comisiones
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>
              ${Number(rentabilidad?.comisionesPagadas || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '10px', display: 'flex' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
          </div>
        </div>

        {/* Tarjeta 3: Bonificaciones */}
        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bonificaciones
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
              ${Number(rentabilidad?.bonificacionesPagadas || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '10px', display: 'flex' }}>
            {/* Ícono distintivo de medalla/premio para las bonificaciones */}
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm8 0h-3M3 8h3m14 0a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V10a2 2 0 012-2h16z" />
            </svg>
          </div>
        </div>

        {/* Tarjeta 4 */}
        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Margen Neto</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>
              ${Number(rentabilidad?.margenLibre || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '10px', display: 'flex' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
        </div>

        {/* Tarjeta 5 */}
        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payout Red</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#9333ea' }}>{rentabilidad?.porcentajeRepartido || 0}%</p>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#faf5ff', color: '#9333ea', borderRadius: '10px', display: 'flex' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
          </div>
        </div>
        
        {/* Tarjeta 6: Sin Nivel 1 */}
        <div style={{ backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monto Nivel 0</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#d97706' }}>
              ${Number(rentabilidad?.montoSinNivel1 || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div style={{ padding: '8px', backgroundColor: '#fffbeb', color: '#d97706', borderRadius: '10px', display: 'flex' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
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

          {/* Input de Fecha con restricción de máximo (mes actual) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '6px 12px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>Mes:</span>
            <input 
              type="month" 
              value={periodoCierre} 
              max={mesActualStr}
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

        {/* ÁREA DE ACCIONES SECUNDARIAS (Cierre de mes vs Exportaciones) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* BOTONES DE EXPORTACIÓN: Visibles únicamente en la vista de Historial */}
          {verHistorico && (
            <>
              <button 
                type="button"
                onClick={() => exportarAExcel(datosHistoricos, periodoCierre)}
                style={{ backgroundColor: '#16a34a', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                📊 Excel
              </button>

              <button 
                type="button"
                onClick={() => exportarAPDF(datosHistoricos, periodoCierre)}
                style={{ backgroundColor: '#dc2626', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                📄 PDF
              </button>
            </>
          )}

          {/* Botón de Cierre: Oculto si se está viendo el historial */}
          {!verHistorico && (
            <button 
              type="button"
              onClick={handleEjecutarCierre}
              disabled={esMesFuturo}
              title={esMesFuturo ? "No puedes cerrar un mes futuro" : "Congelar métricas del período actual"}
              style={{ 
                backgroundColor: esMesFuturo ? '#f3f4f6' : '#dc2626', 
                color: esMesFuturo ? '#9ca3af' : '#ffffff', 
                border: 'none', 
                fontSize: '12px', 
                fontWeight: 'bold', 
                padding: '8px 16px', 
                borderRadius: '12px', 
                cursor: esMesFuturo ? 'not-allowed' : 'pointer', 
                boxShadow: esMesFuturo ? 'none' : '0 1px 2px rgba(0,0,0,0.05)' 
              }}
            >
              🔒 Ejecutar Cierre de Mes
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default DashboardControls;