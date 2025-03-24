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
      INSERT INTO clientes (nombre, email, contraseña, telefono, direccion, role)
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
router.post('/login', (req, res) => {
  const { email, contraseña } = req.body;
  const query = 'SELECT * FROM clientes WHERE email = ?';

  conexion.query(query, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const user = results[0];

    // Verificar la contraseña encriptada
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar el token JWT, incluyendo información útil (id, email, role)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '2h' } // El token expirará en 2 horas
    );

    res.json({ message: 'Inicio de sesión exitoso', token });
  });
});

module.exports = router;
