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
      <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontFamily: 'sans-serif', fontSize: '14px' }}>
        ⏳ Cargando parámetros del sistema...
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '13px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '6px',
    fontFamily: 'sans-serif'
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      border: '1px solid #f3f4f6',
      padding: '28px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      fontFamily: 'sans-serif',
      marginBottom: '32px'
    }}>
      {/* Encabezado */}
      <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚙️ Control de Parámetros MLM
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
          Ajusta los umbrales de calificación, compra mínima y comisiones escalonadas del sistema.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* REGLAS GENERALES */}
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            1. Reglas Generales de Calificación
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '14px', border: '1px solid #f3f4f6' }}>
              <label style={labelStyle}>Compra Mínima para Activación ($)</label>
              <input
                type="number"
                value={general.compra_minima_activacion}
                onChange={(e) => handleGeneralChange('compra_minima_activacion', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '14px', border: '1px solid #f3f4f6' }}>
              <label style={labelStyle}>Factor Bono de Liderazgo (Decimal)</label>
              <input
                type="number"
                step="0.0000000001"
                value={general.factor_liderazgo}
                onChange={(e) => handleGeneralChange('factor_liderazgo', e.target.value)}
                style={inputStyle}
              />
              <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: '600', marginTop: '6px', display: 'block' }}>
                💡 Equivalente a {(general.factor_liderazgo * 100).toFixed(2)}% de bonificación
              </span>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '14px', border: '1px solid #f3f4f6' }}>
              <label style={labelStyle}>Límite de Directos por Patrocinador</label>
              <input
                type="number"
                value={general.limite_directos_bono}
                onChange={(e) => handleGeneralChange('limite_directos_bono', e.target.value)}
                style={inputStyle}
              />
            </div>

          </div>
        </div>

        {/* MATRIZ DE NIVELES */}
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            2. Matriz Escalonada de Niveles
          </h4>

          <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #f3f4f6' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb', color: '#4b5563', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Nivel</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Umbral de Calificación ($)</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>% Comisión Propia</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>% Spread por Red</th>
                </tr>
              </thead>
              <tbody>
                {niveles.map((n, idx) => (
                  <tr key={n.nivel} style={{ borderBottom: idx < niveles.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#111827' }}>
                      <span style={{ backgroundColor: '#eef2ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}>
                        Nivel {n.nivel}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="number"
                        value={n.umbral}
                        onChange={(e) => handleNivelChange(idx, 'umbral', e.target.value)}
                        style={{ ...inputStyle, width: '160px' }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.0000000001"
                          value={n.porcentaje_propio}
                          onChange={(e) => handleNivelChange(idx, 'porcentaje_propio', e.target.value)}
                          style={{ ...inputStyle, width: '120px' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>
                          ({(n.porcentaje_propio * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.0000000001"
                          value={n.spread_red}
                          onChange={(e) => handleNivelChange(idx, 'spread_red', e.target.value)}
                          style={{ ...inputStyle, width: '120px' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280' }}>
                          ({(n.spread_red * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTÓN DE GUARDAR */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
          <button
            type="submit"
            disabled={guardando}
            style={{
              backgroundColor: guardando ? '#a5b4fc' : '#4f46e5',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: guardando ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {guardando ? 'Guardando Cambios...' : '💾 Guardar Parámetros'}
          </button>
        </div>
      </form>
    </div>
  );
}