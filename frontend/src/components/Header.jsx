// src/components/Header.jsx
import { useState, useEffect } from 'react';

export default function Header({ adminUser, onLogout, onOpenConfig }) {
  // Estados posibles: 'online' (Sistema Activo), 'offline' (Sin Conexión a Red), 'error' (Backend Inactivo/Caído)
  const [systemStatus, setSystemStatus] = useState('online');

  useEffect(() => {
    // 1. Escuchar desconexión del cliente (red/WiFi)
    const handleOnline = () => checkStatus();
    const handleOffline = () => setSystemStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Comprobar la respuesta del servidor (Backend)
    const checkStatus = async () => {
      if (!navigator.onLine) {
        setSystemStatus('offline');
        return;
      }

      try {
        // Usa el endpoint /api/health que ya tienes en server.js (Puerto 4000)
        const response = await fetch('http://localhost:4000/api/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // Timeout de 2 segundos
        });

        if (response.ok) {
          setSystemStatus('online');
        } else {
          setSystemStatus('error');
        }
      } catch (err) {
        // Servidor caído o no alcanzable
        setSystemStatus('error');
      }
    };

    // Verificación inicial
    checkStatus();

    // Verificación constante cada 3 segundos
    const interval = setInterval(checkStatus, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Configuración visual según el estado
  const getStatusConfig = () => {
    switch (systemStatus) {
      case 'online':
        return { 
          text: 'Sistema Activo', 
          color: '#10b981', 
          bgColor: '#ecfdf5',
          borderColor: '#a7f3d0'
        };
      case 'offline':
        return { 
          text: 'Sin Red Local', 
          color: '#f59e0b', 
          bgColor: '#fffbeb',
          borderColor: '#fde68a'
        };
      case 'error':
      default:
        return { 
          text: 'Sistema Inactivo', 
          color: '#ef4444', 
          bgColor: '#fef2f2',
          borderColor: '#fecaca'
        };
    }
  };

  const status = getStatusConfig();

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #f3f4f6',
      padding: '20px 0',
      marginBottom: '32px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.005)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          
          {/* Lado Izquierdo: Icono, Título y Subtítulo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                Gestión Profesional de Comisiones con Auditoría Jerárquica
              </p>
            </div>
          </div>

          {/* Lado Derecho: Controles de Sesión e Indicador de Estado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            {/* Indicador de Estado Dinámico */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: status.bgColor,
              padding: '8px 14px',
              borderRadius: '12px',
              border: `1px solid ${status.borderColor}`,
              transition: 'all 0.3s ease'
            }}>
              <span style={{
                height: '8px',
                width: '8px',
                borderRadius: '50%',
                backgroundColor: status.color,
                display: 'inline-block'
              }}></span>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'sans-serif'
              }}>
                {status.text}
              </span>
            </div>

            {/* Administrador con Sesión Iniciada */}
            {adminUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={onOpenConfig}
                  style={{
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  ⚙️ Configuración
                </button>

                <button
                  onClick={onLogout}
                  title="Cerrar Sesión"
                  style={{
                    backgroundColor: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fecaca',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  🚪 Salir
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenConfig}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                🔐 Acceso Admin
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}