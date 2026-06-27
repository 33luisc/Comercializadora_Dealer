import { useState, useEffect } from 'react';

function App() {
  const [afiliados, setAfiliados] = useState([]);
  const [rentabilidad, setRentabilidad] = useState({
    utilidadGlobal: 0, comisionesPagadas: 0, margenLibre: 0, porcentajeRepartido: 0
  });
  const [formData, setFormData] = useState({ nombre: '', id_patrocinador: '', utilidad_propia: '' });

  const [errorMsg, setErrorMsg] = useState('');

  // Cargar datos desde la API
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
  }, []);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg(''); // Limpiar errores previos
  
  try {
    const res = await fetch('http://localhost:4000/api/afiliados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: formData.nombre,
        id_patrocinador: formData.id_patrocinador ? parseInt(formData.id_patrocinador) : null,
        utilidad_propia: formData.utilidad_propia === '' ? 0 : parseFloat(formData.utilidad_propia)
      })
    });
    
    const data = await res.json();

    if (res.ok) {
      setFormData({ nombre: '', id_patrocinador: '', utilidad_propia: '' });
      cargarDatos(); // Recargar todo si salió bien
    } else {
      // Capturamos el error específico enviado por el backend (Ej: Límite de 15)
      setErrorMsg(data.error || 'Ocurrió un error inesperado.');
    }
  } catch (error) {
    setErrorMsg('No se pudo conectar con el servidor backend.');
    console.error("Error al registrar:", error);
  }
};

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Comercializadora Dealer</h1>
        <p className="text-gray-600">Sistema de Gestión de Comisiones Multi-Nivel</p>
      </header>

      {/* SECCIÓN 1: METRICAS DE RENTABILIDAD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium uppercase">Utilidad Total</p>
          <p className="text-2xl font-bold text-gray-800">${Number(rentabilidad.utilidadGlobal).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium uppercase">Comisiones Pagadas</p>
          <p className="text-2xl font-bold text-gray-800">${Number(rentabilidad.comisionesPagadas).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium uppercase">Margen Neto Empresa</p>
          <p className="text-2xl font-bold text-gray-800">${Number(rentabilidad.margenLibre).toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-medium uppercase">% Repartido de Red</p>
          <p className="text-2xl font-bold text-gray-800">{rentabilidad.porcentajeRepartido}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECCIÓN 2: FORMULARIO DE REGISTRO */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Registrar Nuevo Miembro</h2>
          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded text-sm text-red-700 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Nombre del Afiliado</label>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border focus:outline-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Patrocinador Directo</label>
              <select value={formData.id_patrocinador} onChange={(e) => setFormData({...formData, id_patrocinador: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border focus:outline-blue-500">
                <option value="">Ninguno (Es Líder Raíz)</option>
                {afiliados.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre} (ID: {a.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Utilidad Propia del Mes ($)</label>
              <input type="number" required value={formData.utilidad_propia} onChange={(e) => setFormData({...formData, utilidad_propia: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-gray-50 border focus:outline-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150">
              Agregar a la Red
            </button>
          </form>
        </div>

        {/* SECCIÓN 3: TABLA DE AFILIADOS Y COMISIONES */}
        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2 overflow-x-auto">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Árbol de Comisiones Calculadas</h2>
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Patrocinador</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3">U. Propia</th>
                <th className="px-4 py-3">Com. Propia</th>
                <th className="px-4 py-3">Com. Red</th>
                <th className="px-4 py-3">Bono Líder</th>
                <th className="px-4 py-3 font-bold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              {afiliados.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-gray-400">{a.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{a.nombre}</td>
                  
                  {/* NUEVA CELDA: Nombre del Patrocinador */}
                  <td className="px-4 py-3 text-gray-500 font-medium">{a.nombre_patrocinador}</td>
                  
                  {/* NUEVA CELDA: Estado de Activación */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${a.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {a.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${a.nivel === 4 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      Nivel {a.nivel}
                    </span>
                  </td>
                  <td className="px-4 py-3">${Number(a.utilidad_propia).toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600">${Math.round(a.comision_propia).toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600">${Math.round(a.comision_por_red).toLocaleString()}</td>
                  <td className="px-4 py-3 text-purple-600">${Math.round(a.bono_liderazgo).toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">${Math.round(a.comision_total).toLocaleString()}</td>
                </tr>
              ))}
              {afiliados.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-400">No hay afiliados registrados aún. ¡Registra el primero!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;