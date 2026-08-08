import { useState, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import NotificationToasts from './components/NotificationToasts';
import RegisterMemberForm from './components/RegisterMemberForm';
import TransactionModal from './components/TransactionModal';
import LogModal from './components/LogModal';
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
    cargarDatos, cargarPeriodoHistorico, handleRegisterAfiliado, handleAddTransaccion, handleCierreMes, handleDelete, cargarBitacoraAfiliado
  } = useDashboardData();

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', cedula: '', celular: '', correo: '', id_patrocinador: ''
  });

  // Estados de vista y autenticación
  const [vistaActiva, setVistaActiva] = useState('tabla'); // 'tabla' | 'arbol' | 'config'
  const [adminUser, setAdminUser] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // 1. Cargar sesión activa usando sessionStorage (se elimina al cerrar la pestaña/navegador)
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
      fetch('http://localhost:4000/api/ping').catch(() => {
        // Silenciar errores si el backend no responde
      });
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

  // 2. BLOQUEO DE SEGURIDAD: Si no hay usuario autenticado, renderizar ÚNICAMENTE el Login
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
            // Guarda en sessionStorage para que expire al cerrar el navegador
            sessionStorage.setItem('adminUser', JSON.stringify(user));
            sessionStorage.setItem('adminToken', token);
            setAdminUser(user);
            setVistaActiva('tabla');
          }} 
        />
      </div>
    );
  }

  // 3. APLICACIÓN PRINCIPAL (Solo accesible si adminUser es válido)
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

        {/* VISTA 1: PANEL DE CONFIGURACIÓN DE PARÁMETROS */}
        {vistaActiva === 'config' && (
          <div className="mt-6">
            <AdminConfigPanel 
              onConfigSaved={cargarDatos}
              setSuccessMsg={setSuccessMsg}
              setErrorMsg={setErrorMsg}
            />
          </div>
        )}

        {/* VISTA 2: VISTA PRINCIPAL (TABLA / ÁRBOL DE RED) */}
        {(vistaActiva === 'tabla' || vistaActiva === 'arbol') && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '20px', 
            alignItems: 'flex-start', 
            marginTop: '24px',
            width: '100%'
          }}>
            
            {/* Columna Izquierda: Formulario */}
            <div style={{ 
              flex: '0 0 280px',
              maxWidth: '300px',
              backgroundColor: '#ffffff', 
              padding: '20px', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              boxSizing: 'border-box'
            }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '800', color: '#030712', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                👤 Registrar Miembro
              </h3>
              <RegisterMemberForm 
                formData={formData} 
                setFormData={setFormData}
                afiliados={afiliados} 
                onRegister={(e) => handleRegisterAfiliado(e, formData, setFormData)}
              />
            </div>

            {/* Columna Derecha: Tabla o Árbol */}
            <div style={{ 
              flex: '1 1 65%',
              minWidth: '0',
              backgroundColor: '#ffffff', 
              padding: '20px', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              boxSizing: 'border-box'
            }}>
              {vistaActiva === 'tabla' ? (
                <MembersTable 
                  verHistorico={verHistorico} 
                  datosHistoricos={datosHistoricos} 
                  afiliados={afiliados}
                  onOpenBitacora={cargarBitacoraAfiliado} 
                  onDelete={handleDelete}
                  onOpenTransaccion={(a) => { setSelectedAfiliado(a); setModalOpen(true); }}
                />
              ) : (
                <NetworkTree afiliados={afiliados} />
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
    </div>
  );
}

export default App;