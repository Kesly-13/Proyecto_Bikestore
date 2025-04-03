// backend/api/routes/middlewares/isAdmin.js
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'No tienes permisos de administrador' });
  }
}

module.exports = isAdmin;
