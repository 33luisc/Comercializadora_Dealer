// src/components/Header.jsx
export default function Header() {
  return (
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
  );
}