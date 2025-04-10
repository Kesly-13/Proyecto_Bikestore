// frontend/js/modules/api.js
export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('token');
  
  // Verificar si el token existe
  if (!token && url.includes('/checkout')) {
    console.error('No hay token disponible');
    throw new Error('Debes iniciar sesión para realizar esta acción');
  }
  
  // Combina los headers que tengas con el header de Authorization
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : ''
  };

  console.log('Enviando petición con token:', token); // Para depuración
  
  const response = await fetch(url, { ...options, headers });
  return response;
}
