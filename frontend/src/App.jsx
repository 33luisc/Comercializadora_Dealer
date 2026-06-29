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

  const [verHistorico, setVerHistorico] = useState(false); 
  const [datosHistoricos, setDatosHistoricos] = useState([]); 

  const [verBitacora, setVerBitacora] = useState(false); 
  const [afiliadoSeleccionadoBitacora, setAfiliadoSeleccionadoBitacora] = useState(null); 
  const [listaTransacciones, setListaTransacciones] = useState([]); 

  const [vistaActiva, setVistaActiva] = useState('tabla'); 

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

  const cargarPeriodoHistorico = async (periodo) => {
    if (!periodo) return;
    try {
      setErrorMsg('');
      const res = await fetch(`http://localhost:4000/api/historico/${periodo}`);
      const data = await res.json();
      
      if (res.ok) {
        if (data.length === 0) {
          alert(`No se encontraron registros guardados para el periodo ${periodo}`);
          setVerHistorico(false);
          cargarDatos(); 
        } else {
          setDatosHistoricos(data);
          setVerHistorico(true);
        }
      } else {
        setErrorMsg(data.error || 'Error al cargar el histórico.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error conectando con el servidor.');
    }
  };

  useEffect(() => {
    cargarDatos();
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    setPeriodoCierre(`${fecha.getFullYear()}-${mes}`);
  }, []);

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

  const cargarBitacoraAfiliado = async (afiliado) => {
    try {
      setErrorMsg('');
      const res = await fetch(`http://localhost:4000/api/transacciones/${afiliado.id}`);
      const data = await res.json();
      
      if (res.ok) {
        setListaTransacciones(data);
        setAfiliadoSeleccionadoBitacora(afiliado);
        setVerBitacora(true);
      } else {
        setErrorMsg(data.error || 'Error al cargar las transacciones.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Error conectando con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans relative">
      
      <div className="max-w-7xl mx-auto mb-4">
        {errorMsg && <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700 font-medium">⚠️ {errorMsg}</div>}
        {successMsg && <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-sm text-green-700 font-medium">✨ {successMsg}</div>}
      </div>

      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Comercializadora Dealer</h1>
          <p className="text-gray-600">Gestión Profesional de Comisiones con Auditoría</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg max-w-xs mb-4">
          <button
            type="button"
            onClick={() => setVistaActiva('tabla')}
            className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition ${vistaActiva === 'tabla' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            📊 Tabla de Datos
          </button>
          <button
            type="button"
            onClick={() => setVistaActiva('arbol')}
            className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition ${vistaActiva === 'arbol' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            🌿 Organigrama de Red
          </button>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-3 bg-gray-50 p-3 rounded-md border">
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 font-semibold uppercase">Periodo Contable</label>
            <input 
              type="month" 
              value={periodoCierre} 
              onChange={(e) => {
                setPeriodoCierre(e.target.value);
                if(verHistorico) cargarPeriodoHistorico(e.target.value);
              }} 
              className="bg-transparent font-bold text-gray-700 focus:outline-none text-sm" 
            />
          </div>

          <div className="flex space-x-2">
            {verHistorico ? (
              <button 
                onClick={() => {
                  setVerHistorico(false);
                  cargarDatos(); 
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2 px-3 rounded transition"
              >
                👀 Ver Mes Activo
              </button>
            ) : (
              <>
                <button 
                  onClick={() => cargarPeriodoHistorico(periodoCierre)} 
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium text-xs py-2 px-3 rounded transition"
                >
                  🔍 Consultar Historial
                </button>
                <button 
                  onClick={handleCierreMes} 
                  className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs py-2 px-3 rounded transition"
                >
                  🔒 Cerrar Mes
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6 w-full">
          {/* Tarjeta 1 */}
          <div className="flex-1 min-w-[200px] bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Utilidad Bruta</p>
              <p className="text-lg font-bold text-gray-800">${Number(rentabilidad.utilidadGlobal).toLocaleString()}</p>
            </div>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>

          {/* Tarjeta 2 */}
          <div className="flex-1 min-w-[200px] bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Comisiones</p>
              <p className="text-lg font-bold text-gray-800">${Number(rentabilidad.comisionesPagadas).toLocaleString()}</p>
            </div>
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            </div>
          </div>

          {/* Tarjeta 3 */}
          <div className="flex-1 min-w-[200px] bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Margen Neto</p>
              <p className="text-lg font-bold text-gray-800">${Number(rentabilidad.margenLibre).toLocaleString()}</p>
            </div>
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
          </div>

          {/* Tarjeta 4 */}
          <div className="flex-1 min-w-[200px] bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Payout Red</p>
              <p className="text-lg font-bold text-gray-800">{rentabilidad.porcentajeRepartido}%</p>
            </div>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
            </div>
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

          {/* VISTAS CONDICIONALES (CORREGIDO EL DIV ADICIONAL Y LA ESTRUCTURA) */}
          <div className="lg:col-span-2">
            {vistaActiva === 'tabla' ? (
              <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
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
                      {(verHistorico ? datosHistoricos : afiliados).map(a => (
                        <tr key={a.id} className="hover:bg-gray-50 transition">
                          <td className="px-3 py-3 font-mono text-gray-400 text-xs">{a.id}</td>
                          <td className="px-3 py-3 font-medium text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span>{a.nombre}</span>
                              {!verHistorico && (
                                <button
                                  type="button"
                                  onClick={() => cargarBitacoraAfiliado(a)}
                                  className="text-gray-400 hover:text-blue-600 text-xs transition"
                                  title="Ver historial de movimientos"
                                >
                                  🔍
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-500 text-xs">
                            {verHistorico ? 'N/A (Histórico)' : a.nombre_patrocinador}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {a.estado}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${a.nivel === 4 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                              Nivel {a.nivel}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">${Number(a.utilidad_propia).toLocaleString()}</span>
                              {!verHistorico && (
                                <button 
                                  type="button"
                                  onClick={() => { 
                                    setSelectedAfiliado(a); 
                                    setModalOpen(true); 
                                  }} 
                                  className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition font-medium"
                                >
                                  💸 +/-
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-green-600">${Math.round(a.comision_propia).toLocaleString()}</td>
                          <td className="px-3 py-3 text-green-600">${Math.round(a.comision_por_red).toLocaleString()}</td>
                          <td className="px-3 py-3 text-purple-600">${Math.round(a.b_liderazgo || a.bono_liderazgo || 0).toLocaleString()}</td>
                          <td className="px-3 py-3 font-bold text-gray-900">${Math.round(a.comision_total).toLocaleString()}</td>
                          <td className="px-3 py-3 text-right">
                            {!verHistorico && (
                              <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 text-xs font-medium transition">
                                🗑️ Borrar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-[400px]">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Estructura Jerárquica de la Red</h3>
                
                {afiliados.filter(a => !a.id_patrocinador || Number(a.id_patrocinador) === 0 || String(a.id_patrocinador).trim() === "").length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No hay nodos raíz registrados en la red.</p>
                ) : (
                  <div className="space-y-3">
                    {afiliados
                      .filter(a => !a.id_patrocinador || Number(a.id_patrocinador) === 0 || String(a.id_patrocinador).trim() === "")
                      .map(raiz => (
                        <NodoArbol key={raiz.id} miembro={raiz} todosLosAfiliados={afiliados} />
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL SENCILLO */}
      {modalOpen && selectedAfiliado && (
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
            
            <form onSubmit={handleAddTransaccion}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Monto ($)</label>
                <input type="number" required placeholder="Ej: 1500000 o -200000" value={transData.monto} onChange={(e) => setTransData({...transData, monto: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#4b5563', marginBottom: '6px', textTransform: 'uppercase' }}>Concepto</label>
                <input type="text" required placeholder="Ej: Venta de Componentes" value={transData.descripcion} onChange={(e) => setTransData({...transData, descripcion: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#f9fafb', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button type="button" onClick={() => { setModalOpen(false); setSelectedAfiliado(null); setTransData({ monto: '', descripcion: '' }); }} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151', cursor: 'pointer', fontSize: '14px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Aplicar Ajuste</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISOR DE BITÁCORA DE TRANSACCIONES */}
      {verBitacora && afiliadoSeleccionadoBitacora && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998, backdropFilter: 'blur(2px)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Historial de Ventas / Ajustes</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#4b5563' }}>Mes en curso para: <strong style={{ color: '#2563eb' }}>{afiliadoSeleccionadoBitacora.nombre}</strong></p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
              {listaTransacciones.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px', margin: '30px 0' }}>No hay movimientos registrados este mes.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#374151' }}>
                      <th style={{ padding: '8px 4px' }}>Concepto</th>
                      <th style={{ padding: '8px 4px', textAlign: 'right' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaTransacciones.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 4px' }}>
                          <div style={{ fontWeight: '500', color: '#111827' }}>{t.descripcion}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{t.fecha}</div>
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 'bold', color: t.monto >= 0 ? '#16a34a' : '#dc2626' }}>
                          {t.monto >= 0 ? `+` : ''}${Number(t.monto).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              <button onClick={() => { setVerBitacora(false); setAfiliadoSeleccionadoBitacora(null); }} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Cerrar Ventana</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Componente Auxiliar para renderizar la red (CORREGIDO: uso de useState directo)
const NodoArbol = ({ miembro, todosLosAfiliados }) => {
  const [abierto, setAbierto] = useState(true);

  // CORREGIDO: Conversión explícita a Number para evitar problemas de tipos string vs int
  const hijos = todosLosAfiliados.filter(a => Number(a.id_patrocinador) === Number(miembro.id));
  const tieneHijos = hijos.length > 0;

  return (
    <div className="ml-4 pl-2 border-l border-gray-200 my-1 font-sans">
      <div className="flex items-center space-x-2 py-1 bg-white p-2 rounded-md shadow-sm border border-gray-100 max-w-sm">
        {tieneHijos && (
          <button 
            type="button"
            onClick={() => setAbierto(!abierto)} 
            className="text-xs font-bold text-gray-500 hover:text-blue-600 focus:outline-none w-4 h-4 flex items-center justify-center bg-gray-100 rounded"
          >
            {abierto ? '−' : '+'}
          </button>
        )}
        {!tieneHijos && <span className="text-gray-300 text-xs">•</span>}
        
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {miembro.nombre} <span className="text-xs text-gray-400 font-mono">(ID: {miembro.id})</span>
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${miembro.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              Nivel {miembro.nivel}
            </span>
            <span className="text-[11px] text-gray-500">
              Utilidad: ${Number(miembro.utilidad_propia).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {tieneHijos && abierto && (
        <div className="mt-1 space-y-1">
          {hijos.map(hijo => (
            <NodoArbol key={hijo.id} miembro={hijo} todosLosAfiliados={todosLosAfiliados} />
          ))}
        </div>
      )}
    </div>
  );
};

export default App;