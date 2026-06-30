import { useState, useEffect } from 'react';
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

  // Estados para Modales
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
    <div className="min-h-screen bg-gray-50/50 text-gray-900 antialiased font-sans pb-12">
      
      {/* NOTIFICACIONES FLOTANTES */}
      <div className="max-w-7xl mx-auto px-4 pt-4 sm:px-6 lg:px-8">
        {errorMsg && <div className="mb-2 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl text-xs text-red-700 font-semibold shadow-sm animate-fade-in">⚠️ {errorMsg}</div>}
        {successMsg && <div className="mb-2 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-xl text-xs text-green-700 font-semibold shadow-sm animate-fade-in">✨ {successMsg}</div>}
      </div>

      {/* ENCABEZADO INTEGRADO */}
      <header className="bg-white border-b border-gray-200/60 py-5 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-950">Comercializadora Dealer</h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Gestión Profesional de Comisiones con Auditoría Jerárquica</p>
          </div>
        </div>
      </header>

      {/* CUERPO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PANEL DE MANDO CENTRALIZADO */}
        <DashboardControls 
          rentabilidad={rentabilidad}
          vistaActiva={vistaActiva}
          setVistaActiva={setVistaActiva}
          verHistorico={verHistorico}
          setVerHistorico={setVerHistorico}
          periodoCierre={periodoCierre}
          setPeriodoCierre={setPeriodoCierre}
          onCierreMes={handleCierreMes}
          onCargarPeriodoHistorico={cargarPeriodoHistorico}
          onCargarDatos={cargarDatos}
        />

        {/* CONTENIDO INTERACTIVO (Formulario + Visualizador) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6">
            
            {/* Columna Izquierda: Tarjeta de Registro */}
            <div style={{ 
              backgroundColor: '#ffffff', 
              padding: '24px', 
              borderRadius: '20px', 
              border: '1px solid #f3f4f6', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#030712', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                👤 Registrar Nuevo Miembro
              </h3>
              <RegisterMemberForm 
                formData={formData}
                setFormData={setFormData}
                afiliados={afiliados}
                onRegister={handleRegisterAfiliado}
              />
            </div>

            {/* Columna Derecha: Tabla de Afiliados */}
            <div style={{ 
              className: "lg:col-span-3", // Mantiene el ancho en sistemas grid si lo usas
              backgroundColor: '#ffffff', 
              padding: '24px', 
              borderRadius: '20px', 
              border: '1px solid #f3f4f6', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              flex: 3 // Respaldo de alineación flex
            }}>
                            
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

      {/* CONTENEDORES MODALES DE ACCIONES */}
      <TransactionModal 
        modalOpen={modalOpen}
        selectedAfiliado={selectedAfiliado}
        transData={transData}
        setTransData={setTransData}
        onClose={() => { setModalOpen(false); setSelectedAfiliado(null); setTransData({ monto: '', descripcion: '' }); }}
        onSubmit={handleAddTransaccion}
      />

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