// src/hooks/useDashboardData.js
import { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/api';

export function useDashboardData() {
  // Estados de datos primarios
  const [afiliados, setAfiliados] = useState([]);
  const [nivelesConfig, setNivelesConfig] = useState([]); // <--- 1. NUEVO ESTADO
  const [rentabilidad, setRentabilidad] = useState({
    utilidadGlobal: 0,
    comisionesPagadas: 0,
    bonificacionesPagadas: 0,
    margenLibre: 0,
    porcentajeRepartido: 0,
    montoSinNivel1: 0
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

  // Carga inicial de datos
  useEffect(() => {
    cargarDatos();
  }, []);

  // Carga de datos en tiempo real (mes activo) y reseteo del selector al mes actual
  const cargarDatos = async () => {
    try {
      const data = await apiService.obtenerDatosIniciales();
      setAfiliados(Array.isArray(data.afiliados) ? data.afiliados : []);
      setRentabilidad(data.rentabilidad || {});
      
      // Asigna los niveles guardados en la BD (incluyendo los 11 millones)
      if (Array.isArray(data.niveles)) {
        setNivelesConfig(data.niveles);
      }

      setVerHistorico(false);

      const fecha = new Date();
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      setPeriodoCierre(`${año}-${mes}`);
    } catch (error) {
      console.error("Error conectando con la API:", error);
      setErrorMsg("Error al conectar con el servidor.");
    }
  };

  // CÁLCULO UNIFICADO Y DINÁMICO DEL RESUMEN / TARJETAS SUPERIORES
  const resumenAMostrar = useMemo(() => {
    if (verHistorico && datosHistoricos && datosHistoricos.length > 0) {
      // 1. Utilidad Global en el histórico
      const utilidadGlobal = datosHistoricos.reduce(
        (sum, item) => sum + Number(item.utilidad_propia || item.utilidad_acumulada || 0), 0
      );

      // 2. Comisiones pagadas en el histórico
      const comisionesPagadas = datosHistoricos.reduce(
        (sum, item) => sum + (Number(item.comision_propia || 0) + Number(item.comision_por_red || 0)), 0
      );

      // 3. Bonificaciones en el histórico
      const bonificacionesPagadas = datosHistoricos.reduce(
        (sum, item) => sum + Number(item.bono_liderazgo || item.bonificaciones || 0), 0
      );

      const totalDistribucion = comisionesPagadas + bonificacionesPagadas;
      const margenLibre = utilidadGlobal - totalDistribucion;
      const porcentajeRepartido = utilidadGlobal > 0 ? ((totalDistribucion / utilidadGlobal) * 100).toFixed(2) : '0.00';

      const montoSinNivel1 = datosHistoricos
        .filter(item => Number(item.nivel) === 0)
        .reduce((sum, item) => sum + Number(item.utilidad_propia || item.utilidad_acumulada || 0), 0);

      return {
        utilidadGlobal,
        comisionesPagadas,
        bonificacionesPagadas,
        margenLibre,
        porcentajeRepartido,
        montoSinNivel1
      };
    }

    return rentabilidad;
  }, [verHistorico, datosHistoricos, rentabilidad]);

  const handleVerMesActivo = () => {
    cargarDatos();
  };

  const cargarPeriodoHistorico = async (periodo) => {
    if (!periodo) return;
    try {
      setErrorMsg('');
      const data = await apiService.consultarHistorico(periodo);

      const listaExtraida = Array.isArray(data)
        ? data
        : (data?.afiliados || data?.usuarios || []);

      if (listaExtraida.length === 0) {
        alert(`No se encontraron registros guardados para el periodo ${periodo}`);
        cargarDatos();
      } else {
        setDatosHistoricos(listaExtraida);
        setVerHistorico(true);
      }
    } catch (error) {
      setErrorMsg(error.message);
      cargarDatos();
    }
  };

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
    nivelesConfig, // <--- 3. EXPORTAR EL ESTADO
    rentabilidad,
    resumenAMostrar,
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
    handleVerMesActivo,
    handleRegisterAfiliado,
    handleUpdateAfiliado,
    handleAddTransaccion,
    handleCierreMes,
    handleDelete,
    cargarBitacoraAfiliado
  };
}