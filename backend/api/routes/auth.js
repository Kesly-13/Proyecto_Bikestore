// auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Importamos la conexión a la base de datos
const conexion = require('../db/connection');

// Clave secreta para firmar el token (en producción, guarda esta clave en una variable de entorno)
const SECRET_KEY = 'xAE4&g9!pQw7*zRt';  // Cambia esto por una cadena segura

// Ruta de registro
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, contraseña, telefono, direccion, role } = req.body;

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Consulta SQL para insertar el nuevo usuario
    const query = `
      INSERT INTO Usuarios (nombre, email, contraseña, telefono, direccion, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Ejecutar la consulta
    conexion.query(
      query,
      [nombre, email, hashedPassword, telefono, direccion, role || 'cliente'],
      (err, resultado) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error al registrar usuario' });
        }
        res.json({ message: 'Usuario registrado exitosamente' });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta de login
// auth.js
router.post('/login', (req, res) => {
  const { email, contraseña } = req.body;
  const query = 'SELECT * FROM Usuarios WHERE email = ?';

  conexion.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en el servidor' });
    if (results.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const user = results[0];
    console.log("Usuario desde la base de datos:", user);
    console.log("Role del usuario:", user.role); // Log específico del rol

    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,  // Esto es clave
        sub: user.email
      },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    console.log("Token generado:", token);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  });
});



module.exports = router;
