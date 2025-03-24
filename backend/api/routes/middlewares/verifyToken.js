// backend/api/routes/middlewares/verifyToken.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'xAE4&g9!pQw7*zRt'; // Asegúrate de que sea la misma que usaste en auth.js

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ error: 'No se proporcionó token' });
  }

  // Se espera que el token venga en formato "Bearer <token>"
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(400).json({ error: 'Formato de token inválido' });
  }

  const token = tokenParts[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    // Almacena la info decodificada en req.user
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
