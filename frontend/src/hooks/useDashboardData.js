// src/hooks/useDashboardData.js
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export function useDashboardData() {
  // Estados de datos primarios
  const [afiliados, setAfiliados] = useState([]);
  const [rentabilidad, setRentabilidad] = useState({
    utilidadGlobal: 0,
    comisionesPagadas: 0,
    bonificacionesPagadas: 0,
    margenLibre: 0,
    porcentajeRepartido: 0
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

  // Autolimpiar mensajes de éxito en 4 segundos
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Carga inicial de datos y definición de periodo predeterminado
  useEffect(() => {
    cargarDatos();
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    setPeriodoCierre(`${fecha.getFullYear()}-${mes}`);
  }, []);

  // Carga de datos en tiempo real (mes activo)
  const cargarDatos = async () => {
    try {
      const data = await apiService.obtenerDatosIniciales();
      setAfiliados(Array.isArray(data.afiliados) ? data.afiliados : []);
      setRentabilidad(data.rentabilidad || {});
    } catch (error) {
      console.error("Error conectando con la API:", error);
      setErrorMsg("Error al conectar con el servidor.");
    }
  };

  // Carga y normalización de periodo histórico guardado
  const cargarPeriodoHistorico = async (periodo) => {
    if (!periodo) return;
    try {
      setErrorMsg('');
      const data = await apiService.consultarHistorico(periodo);

      // Extrae siempre un arreglo válido sin importar si la API responde con un objeto o un array
      const listaExtraida = Array.isArray(data)
        ? data
        : (data?.afiliados || data?.usuarios || []);

      if (listaExtraida.length === 0) {
        alert(`No se encontraron registros guardados para el periodo ${periodo}`);
        setVerHistorico(false);
        cargarDatos();
      } else {
        setDatosHistoricos(listaExtraida);
        setVerHistorico(true);
      }
    } catch (error) {
      setErrorMsg(error.message);
      setVerHistorico(false);
    }
  };

  // Registro de nuevo afiliado
  const handleRegisterAfiliado = async (e, formData, setFormData) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await apiService.registrarAfiliado(formData);
      setSuccessMsg(`Afiliado "${formData.nombre} ${formData.apellido || ''}" registrado con éxito.`);
      
      setFormData({
        nombre: '',
        apellido: '',
        cedula: '',
        celular: '',
        correo: '',
        id_patrocinador: ''
      });

      cargarDatos();
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  // Edición de información del afiliado
  const handleUpdateAfiliado = async (datosActualizados) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await apiService.actualizarAfiliado(datosActualizados.id, datosActualizados);
      setSuccessMsg('Afiliado actualizado correctamente.');
      
      if (verHistorico) {
        cargarPeriodoHistorico(periodoCierre);
      } else {
        cargarDatos();
      }
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  // Agregar utilidad / compra
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

  // Ejecutar congelamiento y cierre de mes
  const handleCierreMes = async () => {
    if (window.confirm(`¿Estás seguro de cerrar el periodo ${periodoCierre}? Esto congelará las comisiones y reiniciará el mes a $0.`)) {
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const data = await apiService.ejecutarCierre(periodoCierre);
        setSuccessMsg(data.message);
        cargarDatos();
      } catch (error) {
        setErrorMsg(error.message);
      }
    }
  };

  // Eliminar afiliado
  const handleDelete = async (id) => {
    if (window.confirm("¿Deseas eliminar este afiliado de la red?")) {
      setErrorMsg('');
      setSuccessMsg('');
      try {
        await apiService.eliminarAfiliado(id);
        setSuccessMsg('Afiliado removido con éxito.');
        cargarDatos();
      } catch (error) {
        setErrorMsg(error.message);
      }
    }
  };

  // Cargar historial de compras/transacciones por usuario
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
    handleUpdateAfiliado,
    handleAddTransaccion,
    handleCierreMes,
    handleDelete,
    cargarBitacoraAfiliado
  };
}