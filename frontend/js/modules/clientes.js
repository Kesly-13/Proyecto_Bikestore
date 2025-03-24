// frontend/js/modules/clientes.js
import { apiRequest } from './api.js';

export async function getClientes() {
  const response = await apiRequest('http://localhost:3000/api/clientes', { method: 'GET' });
  if (!response.ok) {
    throw new Error('Error al obtener clientes');
  }
  const data = await response.json();
  return data;
}
