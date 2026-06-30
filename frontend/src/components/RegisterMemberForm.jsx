// src/components/RegisterMemberForm.jsx
import React from 'react';

function RegisterMemberForm({ formData, setFormData, afiliados, onRegister }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Registrar Nuevo Miembro</h2>
      <form onSubmit={onRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600">Nombre Completo</label>
          <input 
            type="text" 
            required 
            value={formData.nombre} 
            onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
            className="mt-1 block w-full rounded-md border p-2 bg-gray-50 focus:outline-blue-500 text-sm" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Patrocinador Directo</label>
          <select 
            value={formData.id_patrocinador} 
            onChange={(e) => setFormData({...formData, id_patrocinador: e.target.value})} 
            className="mt-1 block w-full rounded-md border p-2 bg-gray-50 focus:outline-blue-500 text-sm"
          >
            <option value="">Ninguno (Es Líder Raíz)</option>
            {afiliados.map(a => (
              <option key={a.id} value={a.id}>{a.nombre} (ID: {a.id})</option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md text-sm transition">
          Agregar Estructura
        </button>
      </form>
    </div>
  );
}

export default RegisterMemberForm;