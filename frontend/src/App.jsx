import { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import NotificationToasts from './components/NotificationToasts';
import RegisterMemberForm from './components/RegisterMemberForm';
import TransactionModal from './components/TransactionModal';
import LogModal from './components/LogModal';
import MembersTable from './components/MembersTable';
import NetworkTree from './components/NetworkTree';
import DashboardControls from './components/DashboardControls';
import Header from './components/Header';

function App() {
  // 1. Extraemos todo el estado y funciones desde nuestro custom hook
  const {
    afiliados, rentabilidad, periodoCierre, setPeriodoCierre,
    errorMsg, setErrorMsg, successMsg, setSuccessMsg,
    modalOpen, setModalOpen, selectedAfiliado, setSelectedAfiliado, transData, setTransData,
    verHistorico, setVerHistorico, datosHistoricos,
    verBitacora, setVerBitacora, afiliadoSeleccionadoBitacora, setAfiliadoSeleccionadoBitacora, listaTransacciones,
    cargarDatos, cargarPeriodoHistorico, handleRegisterAfiliado, handleAddTransaccion, handleCierreMes, handleDelete, cargarBitacoraAfiliado
  } = useDashboardData();

  // 2. Conservamos los estados locales de UI
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    celular: '',
    correo: '',
    id_patrocinador: ''
  });
  const [vistaActiva, setVistaActiva] = useState('tabla'); 

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
      <Header />

      {/* CUERPO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <DashboardControls 
          rentabilidad={rentabilidad} vistaActiva={vistaActiva} setVistaActiva={setVistaActiva}
          verHistorico={verHistorico} setVerHistorico={setVerHistorico} periodoCierre={periodoCierre}
          setPeriodoCierre={setPeriodoCierre} onCierreMes={handleCierreMes}
          onCargarPeriodoHistorico={cargarPeriodoHistorico} onCargarDatos={cargarDatos}
        />

        {/* CONTENEDOR FLEXBOX AJUSTADO */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '20px', 
          alignItems: 'flex-start', 
          marginTop: '24px',
          width: '100%'
        }}>
          
          {/* Columna Izquierda: Formulario (Compacto y con ancho máximo) */}
          <div style={{ 
            flex: '0 0 280px', // 👈 Ancho fijo compacto de 280px (no crece)
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

          {/* Columna Derecha: Tabla o Árbol (Toma el resto del espacio disponible) */}
          <div style={{ 
            flex: '1 1 65%', // 👈 Se expande para ocupar todo el espacio restante
            minWidth: '0',   // 👈 Permite que los elementos internos manejen scroll si es necesario sin desbordar el flexbox
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