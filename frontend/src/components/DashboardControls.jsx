// src/components/DashboardControls.jsx
import React from 'react';

function DashboardControls({ 
  afiliados, 
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
  // Métricas automáticas basadas en tu arreglo actual
  const totalMiembros = afiliados.length;
  const volumenTotal = afiliados.reduce((sum, a) => sum + (Number(a.utilidad_propia) || 0), 0);
  const comisionesTotales = afiliados.reduce((sum, a) => sum + (Number(a.comision_total) || 0), 0);

  return (
    <div className="mb-6">
      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Miembros</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalMiembros}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Volumen de Ventas Red</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            ${volumenTotal.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Comisiones a Dispersar</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            ${Math.round(comisionesTotales).toLocaleString()}
          </div>
        </div>
      </div>

      {/* BOTONES DE NAVEGACIÓN Y SELECTOR INTEGRADO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        
        {/* Selector de vistas */}
        <div className="flex bg-gray-100 p-1 rounded-lg max-w-xs">
          <button
            type="button"
            onClick={() => setVistaActiva('tabla')}
            className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition ${
              vistaActiva === 'tabla' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            📊 Tabla de Datos
          </button>
          <button
            type="button"
            onClick={() => setVistaActiva('arbol')}
            className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition ${
              vistaActiva === 'arbol' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            🌿 Organigrama de Red
          </button>
        </div>
        
        {/* Controles de Periodo Contable extraídos idénticos de tu código */}
        <div className="flex flex-col md:flex-row items-center gap-3 bg-gray-50 p-3 rounded-md border w-full md:w-auto">
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-xs text-gray-500 font-semibold uppercase">Periodo Contable</label>
            <input 
              type="month" 
              value={periodoCierre} 
              onChange={(e) => {
                setPeriodoCierre(e.target.value);
                if (verHistorico) onCargarPeriodoHistorico(e.target.value);
              }} 
              className="bg-transparent font-bold text-gray-700 focus:outline-none text-sm" 
            />
          </div>

          <div className="flex space-x-2 w-full md:w-auto justify-end">
            {verHistorico ? (
              <button 
                type="button"
                onClick={() => {
                  setVerHistorico(false);
                  onCargarDatos(); 
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-3 rounded transition w-full md:w-auto"
              >
                👀 Ver Mes Activo
              </button>
            ) : (
              <>
                <button 
                  type="button"
                  onClick={() => onCargarPeriodoHistorico(periodoCierre)} 
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium text-xs py-2 px-3 rounded transition"
                >
                  🔍 Consultar Historial
                </button>
                <button 
                  type="button"
                  onClick={onCierreMes} 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs py-2 px-3 rounded transition"
                >
                  🔒 Cerrar Mes
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardControls;