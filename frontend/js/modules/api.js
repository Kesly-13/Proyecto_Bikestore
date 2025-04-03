// frontend/js/modules/api.js
export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('token');
  // Combina los headers que tengas con el header de Authorization
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : ''
  };

  const response = await fetch(url, { ...options, headers });
  return response;
}
