// src/components/NetworkTree/utils/treeHelpers.js

/**
 * Normaliza un texto removiendo tildes, caracteres especiales y convirtiendo a minúsculas.
 * @param {string} texto 
 * @returns {string}
 */
export const limpiarTexto = (texto) => 
  String(texto || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");