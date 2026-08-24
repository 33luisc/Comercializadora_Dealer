// src/services/api.js
const API_BASE = 'http://localhost:4000/api';

export const apiService = {
  async obtenerDatosIniciales() {
    const [resAfiliados, resRentabilidad] = await Promise.all([
      fetch(`${API_BASE}/afiliados`),
      fetch(`${API_BASE}/rentabilidad`)
    ]);
    return {
      afiliados: await resAfiliados.json(),
      rentabilidad: await resRentabilidad.json()
    };
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

  // NUEVO MÉTODO AGREGADO: Edición / Actualización de afiliado
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