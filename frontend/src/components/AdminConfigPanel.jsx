import { useState, useEffect } from 'react';

// Formateador oficial de moneda para Colombia
const formatearCOP = (valor) => {
  const num = parseFloat(valor);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(num);
};

// Auxiliar para convertir un número decimal a representación en string de fracción (ej: 0.1666666667 -> "1/6")
const decimalAFraccion = (val) => {
  const num = parseFloat(val);
  if (isNaN(num) || num === 0) return '0';
  if (num === 1) return '1';
  
  if (Math.abs(num - 1/6) < 0.001) return '1/6';
  if (Math.abs(num - 2/6) < 0.001) return '2/6';
  if (Math.abs(num - 3/6) < 0.001) return '3/6';
  if (Math.abs(num - 4/6) < 0.001) return '4/6';
  if (Math.abs(num - 5/6) < 0.001) return '5/6';

  return num.toString();
};

// Componente para ingresar dinero en formato COP
function COPInput({ value, onChange, style }) {
  const [displayValue, setDisplayValue] = useState(formatearCOP(value));

  useEffect(() => {
    setDisplayValue(formatearCOP(value));
  }, [value]);

  const handleChange = (e) => {
    // Elimina caracteres no numéricos para obtener solo los dígitos
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = parseFloat(rawValue) || 0;
    
    // Notifica al padre el valor numérico puro
    onChange(numericValue);
    setDisplayValue(rawValue ? formatearCOP(numericValue) : '');
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder="$ 0"
      style={style}
    />
  );
}

// Componente para ingresar fracciones libres
function FractionInput({ value, onChange, style }) {
  const [text, setText] = useState(decimalAFraccion(value));

  useEffect(() => {
    setText(decimalAFraccion(value));
  }, [value]);

  const handleBlurOrChange = (inputVal) => {
    setText(inputVal);
    
    if (inputVal.includes('/')) {
      const parts = inputVal.split('/');
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        onChange(num / den);
        return;
      }
    }

    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(0);
    }
  };

  const valorDecimal = parseFloat(value) || 0;
  const porcentaje = (valorDecimal * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="text"
        placeholder="ej. 1/6"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => handleBlurOrChange(e.target.value)}
        style={{ ...style, textAlign: 'center' }}
      />
      <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', minWidth: '45px' }}>
        ({porcentaje}%)
      </span>
    </div>
  );
}

export default function AdminConfigPanel({ onConfigSaved, setSuccessMsg, setErrorMsg }) {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [general, setGeneral] = useState({
    compra_minima_activacion: 50000,
    factor_liderazgo: 0.1666666667,
    limite_directos_bono: 15,
  });
  const [niveles, setNiveles] = useState([]);

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

  const handleGeneralChange = (field, value) => {
    setGeneral((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleNivelChange = (index, field, value) => {
    const nuevosNiveles = [...niveles];
    nuevosNiveles[index][field] = parseFloat(value) || 0;
    setNiveles(nuevosNiveles);
  };

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
      <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚙️ Control de Parámetros MLM
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
          Ajusta los umbrales de calificación en COP y comisiones expresadas en fracciones de sextos.
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
              <label style={labelStyle}>Compra Mínima de Activación (COP)</label>
              <COPInput
                value={general.compra_minima_activacion}
                onChange={(val) => handleGeneralChange('compra_minima_activacion', val)}
                style={inputStyle}
              />
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '14px', border: '1px solid #f3f4f6' }}>
              <label style={labelStyle}>Factor Bono de Liderazgo (Fracción)</label>
              <FractionInput
                value={general.factor_liderazgo}
                onChange={(val) => handleGeneralChange('factor_liderazgo', val)}
                style={inputStyle}
              />
              <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: '600', marginTop: '6px', display: 'block' }}>
                💡 Escribe en formato fracción (ej. 1/6)
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
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Umbral de Calificación (COP)</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Comisión Propia (Fracción)</th>
                  <th style={{ padding: '12px 16px', fontWeight: '700' }}>Spread por Red (Fracción)</th>
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
                      <COPInput
                        value={n.umbral}
                        onChange={(val) => handleNivelChange(idx, 'umbral', val)}
                        style={{ ...inputStyle, width: '180px' }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <FractionInput
                        value={n.porcentaje_propio}
                        onChange={(val) => handleNivelChange(idx, 'porcentaje_propio', val)}
                        style={{ ...inputStyle, width: '110px' }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <FractionInput
                        value={n.spread_red}
                        onChange={(val) => handleNivelChange(idx, 'spread_red', val)}
                        style={{ ...inputStyle, width: '110px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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