import { useState, useEffect } from 'react';

export default function AdminConfigPanel({ onConfigSaved, setSuccessMsg, setErrorMsg }) {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [general, setGeneral] = useState({
    compra_minima_activacion: 50000,
    factor_liderazgo: 0.1666666667,
    limite_directos_bono: 15,
  });
  const [niveles, setNiveles] = useState([]);

  // Cargar la configuración desde el backend
  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:4000/api/configuracion');
      if (!res.ok) throw new Error('Error al cargar la configuración');
      const data = await res.json();
      setGeneral(data.general);
      setNiveles(data.niveles);
    } catch (err) {
      if (setErrorMsg) setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  // Manejar cambios en campos generales
  const handleGeneralChange = (field, value) => {
    setGeneral((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  // Manejar cambios en la matriz de niveles
  const handleNivelChange = (index, field, value) => {
    const nuevosNiveles = [...niveles];
    nuevosNiveles[index][field] = parseFloat(value) || 0;
    setNiveles(nuevosNiveles);
  };

  // Guardar configuración modificada
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const res = await fetch('http://localhost:4000/api/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ general, niveles }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar configuración');

      if (setSuccessMsg) setSuccessMsg('¡Configuración MLM actualizada correctamente!');
      if (onConfigSaved) onConfigSaved();
    } catch (err) {
      if (setErrorMsg) setErrorMsg(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        ⏳ Cargando parámetros del sistema...
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            ⚙️ Control de Parámetros MLM
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajusta los umbrales de calificación, compra mínima y comisiones escalonadas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* REGLAS GENERALES */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            1. Reglas Generales de Calificación
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compra Mínima para Activación ($)
              </label>
              <input
                type="number"
                value={general.compra_minima_activacion}
                onChange={(e) => handleGeneralChange('compra_minima_activacion', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Factor Bono de Liderazgo (Decimal)
              </label>
              <input
                type="number"
                step="0.0000000001"
                value={general.factor_liderazgo}
                onChange={(e) => handleGeneralChange('factor_liderazgo', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {(general.factor_liderazgo * 100).toFixed(2)}% de bonificación
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Límite de Directos por Patrocinador
              </label>
              <input
                type="number"
                value={general.limite_directos_bono}
                onChange={(e) => handleGeneralChange('limite_directos_bono', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>
        </div>

        {/* MATRIZ DE NIVELES */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            2. Matriz Escalonada de Niveles
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="p-3">Nivel</th>
                  <th className="p-3">Umbral de Calificación ($)</th>
                  <th className="p-3">% Comisión Propia</th>
                  <th className="p-3">% Spread por Red</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {niveles.map((n, idx) => (
                  <tr key={n.nivel} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">Nivel {n.nivel}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={n.umbral}
                        onChange={(e) => handleNivelChange(idx, 'umbral', e.target.value)}
                        className="w-full max-w-[140px] px-2 py-1 border border-slate-200 rounded-lg bg-white"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.0000000001"
                        value={n.porcentaje_propio}
                        onChange={(e) => handleNivelChange(idx, 'porcentaje_propio', e.target.value)}
                        className="w-full max-w-[120px] px-2 py-1 border border-slate-200 rounded-lg bg-white"
                      />
                      <span className="ml-2 text-slate-400">
                        ({(n.porcentaje_propio * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.0000000001"
                        value={n.spread_red}
                        onChange={(e) => handleNivelChange(idx, 'spread_red', e.target.value)}
                        className="w-full max-w-[120px] px-2 py-1 border border-slate-200 rounded-lg bg-white"
                      />
                      <span className="ml-2 text-slate-400">
                        ({(n.spread_red * 100).toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTÓN DE GUARDAR */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={guardando}
            className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {guardando ? 'Guardando Cambios...' : '💾 Guardar Parámetros'}
          </button>
        </div>
      </form>
    </div>
  );
}