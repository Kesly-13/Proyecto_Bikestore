const jwt = require('jsonwebtoken');
const SECRET_KEY = 'xAE4&g9!pQw7*zRt'; // Asegúrate de que sea la misma que usaste en auth.js

function verifyToken(req, res, next) {
  // Obtener el token del encabezado Authorization
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    console.log('No authorization header present');
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    // Extraer el token de "Bearer <token>"
    const token = bearerHeader.split(' ')[1];
    if (!token) {
      console.log('Token format invalid');
      return res.status(403).json({ error: 'Formato de token inválido' });
    }
    
    // Verificar el token usando SECRET_KEY definido arriba
    const decoded = jwt.verify(token, SECRET_KEY);
    
    // Añadir la información del usuario a la solicitud
    req.userId = decoded.id;
    console.log('Usuario autenticado:', decoded.id);
    
    // Continuar con la siguiente función en la cadena
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = verifyToken;