import { useState, useEffect } from 'react';

function App() {
  const [afiliados, setAfiliados] = useState([]);
  const [rentabilidad, setRentabilidad] = useState({
    utilidadGlobal: 0, comisionesPagadas: 0, margenLibre: 0, porcentajeRepartido: 0
  });
  const [formData, setFormData] = useState({ nombre: '', id_patrocinador: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados para el Cierre de Mes
  const [periodoCierre, setPeriodoCierre] = useState('');

  // Estados para el Modal de Transacciones
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAfiliado, setSelectedAfiliado] = useState(null);
  const [transData, setTransData] = useState({ monto: '', descripcion: '' });

  const cargarDatos = async () => {
    try {
      const resAfiliados = await fetch('http://localhost:4000/api/afiliados');
      const dataAfiliados = await resAfiliados.json();
      setAfiliados(dataAfiliados);

      const resRentabilidad = await fetch('http://localhost:4000/api/rentabilidad');
      const dataRentabilidad = await resRentabilidad.json();
      setRentabilidad(dataRentabilidad);
    } catch (error) {
      console.error("Error conectando con la API:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
    // Definir el periodo actual por defecto (AAAA-MM)
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    setPeriodoCierre(`${fecha.getFullYear()}-${mes}`);
  }, []);

  // Registrar un nuevo afiliado (Inicia en $0)
  const handleRegisterAfiliado = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('http://localhost:4000/api/afiliados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          id_patrocinador: formData.id_patrocinador ? parseInt(formData.id_patrocinador) : null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Afiliado "${formData.nombre}" registrado con éxito.`);
        setFormData({ nombre: '', id_patrocinador: '' });
        cargarDatos();
      } else {
        setErrorMsg(data.error);
      }
    } catch (error) {
      setErrorMsg('Error al conectar con el servidor.');
    }
  };

  // Registrar un movimiento contable (+ / -)
  const handleAddTransaccion = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:4000/api/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_afiliado: selectedAfiliado.id,
          monto: parseFloat(transData.monto),
          descripcion: transData.descripcion
        })
      });
      if (res.ok) {
        setModalOpen(false);
        setTransData({ monto: '', descripcion: '' });
        cargarDatos();
      } else {
        const data = await res.json();
        setErrorMsg(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Ejecutar el cierre contable del mes
  const handleCierreMes = async () => {
    if (window.confirm(`¿Estás completamente seguro de cerrar el periodo ${periodoCierre}? Esto congelará las comisiones y reiniciará el mes en curso a $0.`)) {
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const res = await fetch('http://localhost:4000/api/cierre-mes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ periodo: periodoCierre })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccessMsg(data.message);
          cargarDatos();
        } else {
          setErrorMsg(data.error);
        }
      } catch (error) {
        setErrorMsg('Error procesando el cierre de mes.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Deseas eliminar este afiliado de la red?")) {
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const res = await fetch(`http://localhost:4000/api/afiliados/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setSuccessMsg('Afiliado removido con éxito.');
          cargarDatos();
        } else {
          const data = await res.json();
          setErrorMsg(data.error);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative">
      
      {/* SECCIÓN DE ALERTAS GENERALES */}
      <div className="max-w-7xl mx-auto mb-4">
        {errorMsg && <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700 font-medium">⚠️ {errorMsg}</div>}
        {successMsg && <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-sm text-green-700 font-medium">✨ {successMsg}</div>}
      </div>

      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Comercializadora Dealer</h1>
          <p className="text-gray-600">Gestión Profesional de Comisiones con Auditoría</p>
        </div>
        
        {/* PANEL DE ACCIÓN: CIERRE DE MES */}
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-gray-50 p-3 rounded-md border">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-semibold uppercase">Periodo Contable</label>
            <input type="month" value={periodoCierre} onChange={(e) => setPeriodoCierre(e.target.value)} className="bg-transparent font-bold text-gray-700 focus:outline-none text-sm" />
          </div>
          <button onClick={handleCierreMes} className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs py-2 px-4 rounded transition">
            🔒 Cerrar Mes
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 font-medium uppercase">Utilidad Bruta (Mes)</p>
            <p className="text-2xl font-bold text-gray-800">${Number(rentabilidad.utilidadGlobal).toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-red-500">
            <p className="text-sm text-gray-500 font-medium uppercase">Comisiones Generadas</p>
            <p className="text-2xl font-bold text-gray-800">${Number(rentabilidad.comisionesPagadas).toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-500 font-medium uppercase">Margen Neto Retenido</p>
            <p className="text-2xl font-bold text-gray-800">${Number(rentabilidad.margenLibre).toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 font-medium uppercase">Payout de la Red</p>
            <p className="text-2xl font-bold text-gray-800">{rentabilidad.porcentajeRepartido}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* REGISTRO DE MIEMBRO */}
          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Registrar Nuevo Miembro</h2>
            <form onSubmit={handleRegisterAfiliado} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nombre Completo</label>
                <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="mt-1 block w-full rounded-md border p-2 bg-gray-50 focus:outline-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Patrocinador Directo</label>
                <select value={formData.id_patrocinador} onChange={(e) => setFormData({...formData, id_patrocinador: e.target.value})} className="mt-1 block w-full rounded-md border p-2 bg-gray-50 focus:outline-blue-500 text-sm">
                  <option value="">Ninguno (Es Líder Raíz)</option>
                  {afiliados.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre} (ID: {a.id})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md text-sm transition">
                Agregar Estructura
              </button>
            </form>
          </div>

          {/* TABLA PRINCIPAL */}
          <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2 overflow-x-auto">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Árbol y Bitácora Activa</h2>
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Nombre</th>
                  <th className="px-3 py-3">Patrocinador</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Nivel</th>
                  <th className="px-3 py-3">U. Acumulada</th>
                  <th className="px-3 py-3">Com. Propia</th>
                  <th className="px-3 py-3">Com. Red</th>
                  <th className="px-3 py-3">Bono Líder</th>
                  <th className="px-3 py-3 font-bold text-gray-700">Total</th>
                  <th className="px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {afiliados.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3 font-mono text-gray-400 text-xs">{a.id}</td>
                    <td className="px-3 py-3 font-medium text-gray-900">{a.nombre}</td>
                    <td className="px-3 py-3 text-gray-500 text-xs">{a.nombre_patrocinador}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {a.estado}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${a.nivel === 4 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        N1:{a.nivel}
                      </span>
                    </td>
                    
                    {/* UTILIDAD EN TIEMPO REAL CON BOTÓN DE AUDITORÍA */}
                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold">${Number(a.utilidad_propia).toLocaleString()}</span>
                        <button onClick={() => { setSelectedAfiliado(a); setModalOpen(true); }} className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 transition" title="Registrar Movimiento">
                          💸 +/-
                        </button>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-green-600">${Math.round(a.comision_propia).toLocaleString()}</td>
                    <td className="px-3 py-3 text-green-600">${Math.round(a.comision_por_red).toLocaleString()}</td>
                    <td className="px-3 py-3 text-purple-600">${Math.round(a.b_liderazgo || a.bono_liderazgo || 0).toLocaleString()}</td>
                    <td className="px-3 py-3 font-bold text-gray-900">${Math.round(a.comision_total).toLocaleString()}</td>
                    
                    <td className="px-3 py-3 text-right">
                      <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 text-xs font-medium transition">
                        🗑️ Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL INTERACTIVO PARA AGREGAR TRANSACCIONES / AJUSTES */}
      {modalOpen && selectedAfiliado && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Registrar Transacción</h3>
            <p className="text-sm text-gray-500 mb-4">Añadirás o restarás un valor a la utilidad del mes para: <strong className="text-gray-700">{selectedAfiliado.nombre}</strong></p>
            
            <form onSubmit={handleAddTransaccion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Monto ($)</label>
                <input type="number" required step="any" placeholder="Ej: 1500000 o -200000 para resta" value={transData.monto} onChange={(e) => setTransData({...transData, monto: e.target.value})} className="mt-1 block w-full rounded-md border p-2 bg-gray-50 text-sm focus:outline-blue-500" />
                <span className="text-xs text-gray-400 mt-1 block">Para restar una devolución, pon el signo de menos (-) antes de la cifra.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Concepto / Descripción</label>
                <input type="text" required placeholder="Ej: Venta de GPU RTX 4060 / Devolución componente" value={transData.descripcion} onChange={(e) => setTransData({...transData, descripcion: e.target.value})} className="mt-1 block w-full rounded-md border p-2 bg-gray-50 text-sm focus:outline-blue-500" />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setTransData({ monto: '', descripcion: '' }); }} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-md transition">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md font-medium transition">
                  Aplicar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;