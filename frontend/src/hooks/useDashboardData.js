// src/hooks/useDashboardData.js
import { useState, useEffect } from 'react';
import { apiService } from '../services/api'; // Asegúrate de que la ruta a tu apiService sea correcta

export function useDashboardData() {
  // Estados de datos primarios
  const [afiliados, setAfiliados] = useState([]);
  const [rentabilidad, setRentabilidad] = useState({
    utilidadGlobal: 0, comisionesPagadas: 0, margenLibre: 0, porcentajeRepartido: 0
  });
  const [periodoCierre, setPeriodoCierre] = useState('');
  
  // Estados de notificaciones
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados de modales y flujos secundarios
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAfiliado, setSelectedAfiliado] = useState(null);
  const [transData, setTransData] = useState({ monto: '', descripcion: '' });

  const [verHistorico, setVerHistorico] = useState(false); 
  const [datosHistoricos, setDatosHistoricos] = useState([]); 

  const [verBitacora, setVerBitacora] = useState(false); 
  const [afiliadoSeleccionadoBitacora, setAfiliadoSeleccionadoBitacora] = useState(null); 
  const [listaTransacciones, setListaTransacciones] = useState([]);

  // Autolimpiar éxito en 4 segundos
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Carga inicial de datos y mes por defecto
  useEffect(() => {
    cargarDatos();
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    setPeriodoCierre(`${fecha.getFullYear()}-${mes}`);
  }, []);

  // Lógica de negocio (Funciones API)
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

  const handleRegisterAfiliado = async (e, formData, setFormData) => {
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

  // Exportamos todo listo para ser usado por el componente App
  return {
    afiliados,
    rentabilidad,
    periodoCierre,
    setPeriodoCierre,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    modalOpen,
    setModalOpen,
    selectedAfiliado,
    setSelectedAfiliado,
    transData,
    setTransData,
    verHistorico,
    setVerHistorico,
    datosHistoricos,
    verBitacora,
    setVerBitacora,
    afiliadoSeleccionadoBitacora,
    setAfiliadoSeleccionadoBitacora,
    listaTransacciones,
    cargarDatos,
    cargarPeriodoHistorico,
    handleRegisterAfiliado,
    handleAddTransaccion,
    handleCierreMes,
    handleDelete,
    cargarBitacoraAfiliado
  };
}