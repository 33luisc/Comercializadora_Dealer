// src/App.jsx
import { useState } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import NotificationToasts from './components/NotificationToasts';
import RegisterMemberForm from './components/RegisterMemberForm';
import TransactionModal from './components/TransactionModal';
import LogModal from './components/LogModal';
import MembersTable from './components/MembersTable';
import NetworkTree from './components/NetworkTree';
import DashboardControls from './components/DashboardControls';

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

  // 2. Conservamos aquí los únicos dos estados que controlan formularios e interfaz local en el App
  const [formData, setFormData] = useState({ nombre: '', id_patrocinador: '' });
  const [vistaActiva, setVistaActiva] = useState('tabla'); 

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 antialiased font-sans pb-12">
      
      {/* COMPONENTE DE NOTIFICACIONES EXTRAÍDO */}
      <NotificationToasts 
        errorMsg={errorMsg} 
        successMsg={successMsg} 
        setErrorMsg={setErrorMsg} 
        setSuccessMsg={setSuccessMsg} 
      />

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

        {/* CONTENEDOR FLEXBOX */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '24px', 
          alignItems: 'flex-start', 
          marginTop: '24px',
          width: '100%'
        }}>
          
          {/* Columna Izquierda: Formulario */}
          <div style={{ 
            flex: '1 1 320px', 
            backgroundColor: '#ffffff', 
            padding: '24px', 
            borderRadius: '20px', 
            border: '1px solid #f3f4f6', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#030712', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
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
            flex: '3 1 600px', 
            backgroundColor: '#ffffff', 
            padding: '24px', 
            borderRadius: '20px', 
            border: '1px solid #f3f4f6', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            boxSizing: 'border-box',
            overflow: 'hidden'
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

      {/* MODALES MANTENIDOS AL FINAL */}
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