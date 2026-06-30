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

     {/* ENCABEZADO MODERNO CON ESTILOS INLINE FORZADOS */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #f3f4f6',
        padding: '24px 0',
        marginBottom: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.005)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'between',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            
            {/* Lado Izquierdo: Icono, Título y Subtítulo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Contenedor del Icono Redondeado (Estilo tus tarjetas de métricas) */}
              <div style={{
                height: '48px',
                width: '48px',
                borderRadius: '16px',
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)'
              }}>
                📊
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{
                    margin: 0,
                    fontSize: '24px',
                    fontWeight: '900',
                    letterSpacing: '-0.05em',
                    color: '#030712',
                    fontFamily: 'sans-serif'
                  }}>
                    Comercializadora <span style={{ color: '#4f46e5' }}>Dealer</span>
                  </h1>
                  {/* Pequeña etiqueta de versión */}
                  <span style={{
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: '1px solid #e5e7eb'
                  }}>
                    v1.0
                  </span>
                </div>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '13px',
                  color: '#6b7280',
                  fontWeight: '500',
                  fontFamily: 'sans-serif'
                }}>
                  Gestión Profesional de Comisiones 
                </p>
              </div>
            </div>

            {/* Lado Derecho: Indicador de Estado en Línea */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f9fafb',
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1px solid #f3f4f6'
            }}>
              {/* Circuito / Punto verde de estado */}
              <span style={{
                height: '8px',
                width: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'inline-block'
              }}></span>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#4b5563',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'sans-serif'
              }}>
                Sistema Activo
              </span>
            </div>

          </div>
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