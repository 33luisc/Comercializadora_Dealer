// src/services/api.js
const API_BASE = 'http://localhost:4000/api';

export const apiService = {
  // Carga paralela de afiliados, rentabilidad y configuración de niveles de la BD
  async obtenerDatosIniciales() {
    const [resAfiliados, resRentabilidad, resConfig] = await Promise.all([
      fetch(`${API_BASE}/afiliados`),
      fetch(`${API_BASE}/rentabilidad`),
      fetch(`${API_BASE}/configuracion`)
    ]);

    const dataConfig = await resConfig.json();

    return {
      afiliados: await resAfiliados.json(),
      rentabilidad: await resRentabilidad.json(),
      // Extrae la lista de niveles desde la respuesta
      niveles: dataConfig?.niveles || (Array.isArray(dataConfig) ? dataConfig : [])
    };
  },

  // Consulta explícita de la configuración MLM
  async obtenerConfiguracion() {
    const res = await fetch(`${API_BASE}/configuracion`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Error al obtener la configuración.');
    }
    return data;
  },

  async registrarAfiliado(formData) {
    const res = await fetch(`${API_BASE}/afiliados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        celular: formData.celular,
        correo: formData.correo || null,
        id_patrocinador: formData.id_patrocinador ? parseInt(formData.id_patrocinador) : null
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al registrar.');
    return data;
  },

  // Edición / Actualización de afiliado
  async actualizarAfiliado(id, datosActualizados) {
    const token = sessionStorage.getItem('adminToken');
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/afiliados/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        nombre: datosActualizados.nombre,
        apellido: datosActualizados.apellido,
        cedula: datosActualizados.cedula,
        celular: datosActualizados.celular,
        correo: datosActualizados.correo || null,
        id_patrocinador: datosActualizados.id_patrocinador ? parseInt(datosActualizados.id_patrocinador) : null
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Error al actualizar el afiliado.');
    }
    return data;
  },

  // Verificación de contraseña de administrador para modales/confirmaciones
  async verificarPassword(password, usuario = 'admin') {
    const res = await fetch(`${API_BASE}/auth/verify-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: usuario,
        password: password
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Contraseña incorrecta o error de verificación.');
    }
    return data;
  },

  async agregarTransaccion(idAfiliado, monto, descripcion) {
    const res = await fetch(`${API_BASE}/transacciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_afiliado: idAfiliado, monto: parseFloat(monto), descripcion })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || data.message || 'Error en la transacción.');
    }
  },

  async ejecutarCierre(periodo) {
    const res = await fetch(`${API_BASE}/cierre-mes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodo })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error en el cierre.');
    return data;
  },

  async eliminarAfiliado(id) {
    const res = await fetch(`${API_BASE}/afiliados/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || data.message || 'Error al eliminar.');
    }
  },

  async consultarHistorico(periodo) {
    const res = await fetch(`${API_BASE}/historico/${periodo}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al cargar histórico.');
    return data;
  },

  async consultarTransacciones(idAfiliado) {
    const res = await fetch(`${API_BASE}/transacciones/${idAfiliado}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Error al cargar bitácora.');
    return data;
  }
};