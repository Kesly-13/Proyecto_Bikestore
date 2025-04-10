// ./middlewares/isAdmin.js
const conexion = require('../../db/connection');

function isAdmin(req, res, next) {
  const userId = req.userId;
  
  // Si no hay userId, rechazar
  if (!userId) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  // Consultar si el usuario tiene rol de administrador
  conexion.query('SELECT role FROM usuarios WHERE id = ?', [userId], (error, results) => {
    if (error) {
      console.error('Error verificando rol de usuario:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    if (results.length > 0 && results[0].role === 'admin') {
      // Usuario es administrador, permitir acceso
      next();
    } else {
      // Para rutas de checkout, permitir acceso a usuarios normales
      if (req.originalUrl.includes('/checkout')) {
        next();
      } else {
        // Para otras rutas protegidas, rechazar si no es admin
        return res.status(403).json({ error: 'No tienes permisos de administrador' });
      }
    }
  });
}

module.exports = isAdmin;