// src/App.jsx
import { useState, useEffect } from 'react';
import { apiService } from './services/api';
import RegisterMemberForm from './components/RegisterMemberForm';
import TransactionModal from './components/TransactionModal';
import LogModal from './components/LogModal';
import MembersTable from './components/MembersTable';
import NetworkTree from './components/NetworkTree';
import DashboardControls from './components/DashboardControls';

function App() {
  const [afiliados, setAfiliados] = useState([]);
  const [rentabilidad, setRentabilidad] = useState({
    utilidadGlobal: 0, comisionesPagadas: 0, margenLibre: 0, porcentajeRepartido: 0
  });
  const [formData, setFormData] = useState({ nombre: '', id_patrocinador: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [periodoCierre, setPeriodoCierre] = useState('');

  // Modales
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
      const data = await apiService.obtenerDatosIniciales();
      setAfiliados(data.afiliados);
      setRentabilidad(data.rentabilidad);
    } catch (error) {
      console.error("Error conectando con la API:", error);
    }
  };

  const cargarPeriodoHistorico = async (periodo) => {
    if (!periodo) return;
    try {
      setErrorMsg('');
      const data = await apiService.consultarHistorico(periodo);
      if (data.length === 0) {
        alert(`No se encontraron registros guardados para el periodo ${periodo}`);
        setVerHistorico(false);
        cargarDatos(); 
      } else {
        setDatosHistoricos(data);
        setVerHistorico(true);
      }
    } catch (error) {
      setErrorMsg(error.message);
      setVerHistorico(false);
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
    setErrorMsg(''); setSuccessMsg('');
    try {
      await apiService.registrarAfiliado(formData.nombre, formData.id_patrocinador);
      setSuccessMsg(`Afiliado "${formData.nombre}" registrado con éxito.`);
      setFormData({ nombre: '', id_patrocinador: '' });
      cargarDatos();
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleAddTransaccion = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await apiService.agregarTransaccion(selectedAfiliado.id, transData.monto, transData.descripcion);
      setModalOpen(false);
      setTransData({ monto: '', descripcion: '' });
      cargarDatos();
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  const handleCierreMes = async () => {
    if (window.confirm(`¿Estás seguro de cerrar el periodo ${periodoCierre}? Esto congelará las comisiones y reiniciará el mes a $0.`)) {
      setErrorMsg(''); setSuccessMsg('');
      try {
        const data = await apiService.ejecutarCierre(periodoCierre);
        setSuccessMsg(data.message);
        cargarDatos();
      } catch (error) {
        setErrorMsg(error.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Deseas eliminar este afiliado de la red?")) {
      setErrorMsg(''); setSuccessMsg('');
      try {
        await apiService.eliminarAfiliado(id);
        setSuccessMsg('Afiliado removido con éxito.');
        cargarDatos();
      } catch (error) {
        setErrorMsg(error.message);
      }
    }
  };

  const cargarBitacoraAfiliado = async (afiliado) => {
    try {
      setErrorMsg('');
      const data = await apiService.consultarTransacciones(afiliado.id);
      setListaTransacciones(data);
      setAfiliadoSeleccionadoBitacora(afiliado);
      setVerBitacora(true);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 antialiased font-sans pb-12">
      
      {/* NOTIFICACIONES */}
      <div className="max-w-7xl mx-auto px-4 pt-4 sm:px-6 lg:px-8">
        {errorMsg && <div className="mb-2 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl text-xs text-red-700 font-semibold shadow-sm">⚠️ {errorMsg}</div>}
        {successMsg && <div className="mb-2 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-xl text-xs text-green-700 font-semibold shadow-sm">✨ {successMsg}</div>}
      </div>

      {/* ENCABEZADO */}
      <header className="bg-white border-b border-gray-200/60 py-5 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-black tracking-tight text-gray-950">Comercializadora Dealer</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Gestión Profesional de Comisiones con Auditoría Jerárquica</p>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <DashboardControls 
          rentabilidad={rentabilidad} vistaActiva={vistaActiva} setVistaActiva={setVistaActiva}
          verHistorico={verHistorico} setVerHistorico={setVerHistorico} periodoCierre={periodoCierre}
          setPeriodoCierre={setPeriodoCierre} onCierreMes={handleCierreMes}
          onCargarPeriodoHistorico={cargarPeriodoHistorico} onCargarDatos={cargarDatos}
        />

        {/* REPARADO EL GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6">
          
          {/* Columna Izquierda: Formulario (Ocupa 1 columna) */}
          <div style={{ 
            backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', 
            border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#030712', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              👤 Registrar Miembro
            </h3>
            <RegisterMemberForm 
              formData={formData} setFormData={setFormData}
              afiliados={afiliados} onRegister={handleRegisterAfiliado}
            />
          </div>

          {/* Columna Derecha: Tabla/Árbol (Ocupa 3 columnas reales de Tailwind) */}
          <div className="lg:col-span-3" style={{ 
            backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', 
            border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            {vistaActiva === 'tabla' ? (
              <MembersTable 
                verHistorico={verHistorico} datosHistoricos={datosHistoricos} afiliados={afiliados}
                onOpenBitacora={cargarBitacoraAfiliado} onDelete={handleDelete}
                onOpenTransaccion={(a) => { setSelectedAfiliado(a); setModalOpen(true); }}
              />
            ) : (
              <NetworkTree afiliados={afiliados} />
            )}
          </div>

        </div>
      </main>

      {/* MODALES */}
      <TransactionModal 
        modalOpen={modalOpen} selectedAfiliado={selectedAfiliado} transData={transData} setTransData={setTransData}
        onClose={() => { setModalOpen(false); setSelectedAfiliado(null); setTransData({ monto: '', descripcion: '' }); }}
        onSubmit={handleAddTransaccion}
      />

      <LogModal 
        verBitacora={verBitacora} afiliadoSeleccionadoBitacora={afiliadoSeleccionadoBitacora}
        listaTransacciones={listaTransacciones} onClose={() => { setVerBitacora(false); setAfiliadoSeleccionadoBitacora(null); }}
      />
    </div>
  );
}

export default App;