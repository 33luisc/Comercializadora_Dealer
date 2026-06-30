import { useState, useEffect } from 'react';
import RegisterMemberForm from './components/RegisterMemberForm';
import TransactionModal from './components/TransactionModal';
import LogModal from './components/LogModal';
import MembersTable from './components/MembersTable';
import NetworkTree from './components/NetworkTree';

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
            <RegisterMemberForm 
              formData={formData}
              setFormData={setFormData}
              afiliados={afiliados}
              onRegister={handleRegisterAfiliado}
            />

          {/* VISTA ACTIVA: TABLA O ARBOL */}
            <div style={{ flex: 2 }}>
              {vistaActiva === 'tabla' ? (
                <MembersTable 
                  verHistorico={verHistorico}
                  datosHistoricos={datosHistoricos}
                  afiliados={afiliados}
                  onOpenBitacora={cargarBitacoraAfiliado}
                  onOpenTransaccion={(a) => { setSelectedAfiliado(a); setModalOpen(true); }}
                  onDelete={handleDelete}
                />
              ) : (
                <NetworkTree afiliados={afiliados} />
              )}
            </div>
          </div>
             
      </main>

      {/* MODAL SENCILLO DE TRANSACCIÓN */}
        <TransactionModal 
          modalOpen={modalOpen}
          selectedAfiliado={selectedAfiliado}
          transData={transData}
          setTransData={setTransData}
          onClose={() => { setModalOpen(false); setSelectedAfiliado(null); setTransData({ monto: '', descripcion: '' }); }}
          onSubmit={handleAddTransaccion}
        />

        {/* VISOR DE BITÁCORA DE TRANSACCIONES */}
        <LogModal 
          verBitacora={verBitacora}
          afiliadoSeleccionadoBitacora={afiliadoSeleccionadoBitacora}
          listaTransacciones={listaTransacciones}
          onClose={() => { setVerBitacora(false); setAfiliadoSeleccionadoBitacora(null); }}
        />
      </div>
  );
}

export default App;