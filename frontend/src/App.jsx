// src/App.jsx
import { useState, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import NotificationToasts from './components/NotificationToasts';
import RegisterMemberForm from './components/RegisterMemberForm';
import TransactionModal from './components/TransactionModal';
import LogModal from './components/LogModal';
import ModalDetalleComision from './components/ModalDetalleComision';
import MembersTable from './components/MembersTable';
import NetworkTree from './components/NetworkTree';
import DashboardControls from './components/DashboardControls';
import Header from './components/Header';
import LoginView from './components/LoginView';
import AdminConfigPanel from './components/AdminConfigPanel';

function App() {
  const {
    afiliados, rentabilidad, periodoCierre, setPeriodoCierre,
    errorMsg, setErrorMsg, successMsg, setSuccessMsg,
    modalOpen, setModalOpen, selectedAfiliado, setSelectedAfiliado, transData, setTransData,
    verHistorico, setVerHistorico, datosHistoricos,
    verBitacora, setVerBitacora, afiliadoSeleccionadoBitacora, setAfiliadoSeleccionadoBitacora, listaTransacciones,
    cargarDatos, cargarPeriodoHistorico, handleRegisterAfiliado, handleAddTransaccion, handleCierreMes, handleDelete, cargarBitacoraAfiliado,
    handleUpdateAfiliado // 👈 1. Extraemos la función del hook
  } = useDashboardData();

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', cedula: '', celular: '', correo: '', id_patrocinador: ''
  });

  // Estados de vista y autenticación
  const [vistaActiva, setVistaActiva] = useState('tabla'); 
  const [adminUser, setAdminUser] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Estado para el modal de comisiones
  const [usuarioComisionSeleccionado, setUsuarioComisionSeleccionado] = useState(null);

  // 1. Cargar sesión activa usando sessionStorage
  useEffect(() => {
    const savedUser = sessionStorage.getItem('adminUser');
    const token = sessionStorage.getItem('adminToken');
    if (savedUser && token) {
      try {
        setAdminUser(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
      }
    }
    setCargandoSesion(false);
  }, []);

  // 2. Heartbeat para indicar al Backend que la pestaña del navegador sigue abierta
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:4000/api/ping').catch(() => {});
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Manejador del Cierre de Sesión Manual
  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    setAdminUser(null);
    setVistaActiva('tabla');
  };

  // 1. PANTALLA DE CARGA DE SESIÓN
  if (cargandoSesion) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#6b7280' }}>
        ⏳ Cargando aplicación...
      </div>
    );
  }

  // 2. BLOQUEO DE SEGURIDAD
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col justify-center items-center font-sans">
        <NotificationToasts 
          errorMsg={errorMsg} 
          successMsg={successMsg} 
          setErrorMsg={setErrorMsg} 
          setSuccessMsg={setSuccessMsg} 
        />
        <LoginView 
          onLoginSuccess={(user, token) => {
            sessionStorage.setItem('adminUser', JSON.stringify(user));
            sessionStorage.setItem('adminToken', token);
            setAdminUser(user);
            setVistaActiva('tabla');
          }} 
        />
      </div>
    );
  }

  // 3. APLICACIÓN PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 antialiased font-sans pb-12">
      
      {/* NOTIFICACIONES */}
      <NotificationToasts 
        errorMsg={errorMsg} 
        successMsg={successMsg} 
        setErrorMsg={setErrorMsg} 
        setSuccessMsg={setSuccessMsg} 
      />

      {/* ENCABEZADO */}
      <Header 
        adminUser={adminUser} 
        onLogout={handleLogout}
        onOpenConfig={() => setVistaActiva('config')}
      />

      {/* CUERPO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* NAVEGACIÓN Y CONTROLES DEL DASHBOARD */}
        {vistaActiva !== 'config' && (
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
            datosHistoricos={datosHistoricos}
          />
        )}

        {/* VISTA 1: PANEL DE CONFIGURACIÓN DE PARÁMETROS */}
        {vistaActiva === 'config' && (
          <div className="mt-6">
            <div className="mb-4">
              <button
                onClick={() => setVistaActiva('tabla')}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                ⬅️ Volver al Panel Principal
              </button>
            </div>

            <AdminConfigPanel 
              onConfigSaved={cargarDatos}
              setSuccessMsg={setSuccessMsg}
              setErrorMsg={setErrorMsg}
            />
          </div>
        )}

        {/* VISTA 2: VISTA PRINCIPAL (TABLA / ÁRBOL DE RED) */}
        {(vistaActiva === 'tabla' || vistaActiva === 'arbol') && (
          <div className="mt-6 flex flex-col lg:flex-row gap-6 items-start w-full">
            
            {/* Columna Izquierda: Formulario */}
            <div className="w-full lg:w-[280px] lg:flex-shrink-0 bg-white p-5 rounded-2xl box-border">
              <RegisterMemberForm 
                formData={formData} 
                setFormData={setFormData}
                afiliados={afiliados} 
                onRegister={(e) => handleRegisterAfiliado(e, formData, setFormData)}
              />
            </div>

            {/* Columna Derecha: Tabla o Árbol */}
            <div className="w-full flex-1 min-w-0 bg-white p-5 rounded-2xl box-border overflow-hidden">
              {vistaActiva === 'tabla' ? (
                <MembersTable 
                  verHistorico={verHistorico} 
                  datosHistoricos={datosHistoricos} 
                  afiliados={afiliados}
                  onOpenBitacora={cargarBitacoraAfiliado} 
                  onDelete={handleDelete}
                  onOpenTransaccion={(a) => { setSelectedAfiliado(a); setModalOpen(true); }}
                  onOpenDetalleComision={(a) => setUsuarioComisionSeleccionado(a)}
                  onSaveEdit={handleUpdateAfiliado} // 👈 2. Conectamos la prop con el handler
                />
              ) : (
                <NetworkTree 
                  afiliados={afiliados} 
                  onOpenDetalleComision={(a) => setUsuarioComisionSeleccionado(a)} 
                />
              )}
            </div>

          </div>
        )}
      </main>

      {/* MODALES */}
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

      <ModalDetalleComision 
        usuario={usuarioComisionSeleccionado}
        onClose={() => setUsuarioComisionSeleccionado(null)}
      />
    </div>
  );
}

export default App;