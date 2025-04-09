// routes/admin.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Middlewares
const verifyToken = require('./middlewares/verifyToken');
const isAdmin = require('./middlewares/isAdmin');

// Importamos la conexión a la base de datos
const conexion = require('../db/connection');

// Obtener todos los usuarios (solo para administradores)
router.get('/usuarios', verifyToken, isAdmin, (req, res) => {
    const query = 'SELECT id, nombre, email, telefono, direccion, role, fecha_registro FROM Usuarios';
    
    conexion.query(query, (error, resultados) => {
        if (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(resultados);
    });
});

// Obtener un usuario específico (solo para administradores)
router.get('/usuarios/:id', verifyToken, isAdmin, (req, res) => {
    const { id } = req.params;
    const query = 'SELECT id, nombre, email, telefono, direccion, role FROM Usuarios WHERE id = ?';
    
    conexion.query(query, [id], (error, resultados) => {
        if (error) {
            console.error('Error al obtener usuario:', error);
            return res.status(500).json({ error: 'Error al obtener usuario' });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(resultados[0]);
    });
});

// Crear un nuevo usuario (solo para administradores)
router.post('/usuarios', verifyToken, isAdmin, async (req, res) => {
    try {
        const { nombre, email, contraseña, telefono, direccion, role } = req.body;
        
        // Validar campos requeridos
        if (!nombre || !email || !contraseña) { // <-- ¡Aquí se usa "contraseña"!
            return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
        }
        
        // Verificar si el email ya existe
        conexion.query('SELECT id FROM Usuarios WHERE email = ?', [email], async (error, resultados) => {
            if (error) {
                console.error('Error al verificar email:', error);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            if (resultados.length > 0) {
                return res.status(400).json({ error: 'Este email ya está registrado' });
            }
            
            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            
            // Insertar nuevo usuario
            const query = `
                INSERT INTO Usuarios (nombre, email, contraseña, telefono, direccion, role)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            conexion.query(
                query,
                [nombre, email, hashedPassword, telefono || null, direccion || null, role || 'cliente'],
                (error, resultado) => {
                    if (error) {
                        console.error('Error al crear usuario:', error);
                        return res.status(500).json({ error: 'Error al crear usuario' });
                    }
                    
                    res.status(201).json({
                        id: resultado.insertId,
                        nombre,
                        email,
                        telefono,
                        direccion,
                        role: role || 'cliente'
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Actualizar un usuario (solo para administradores)
router.put('/usuarios/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, direccion, role } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    
    // Verificar si el usuario existe
    conexion.query('SELECT id FROM Usuarios WHERE id = ?', [id], (error, resultados) => {
        if (error) {
            console.error('Error al verificar usuario:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Verificar si el email ya está en uso por otro usuario
        conexion.query('SELECT id FROM Usuarios WHERE email = ? AND id != ?', [email, id], (error, resultados) => {
            if (error) {
                console.error('Error al verificar email:', error);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            
            if (resultados.length > 0) {
                return res.status(400).json({ error: 'Este email ya está en uso por otro usuario' });
            }
            
            // Actualizar usuario
            const query = `
                UPDATE Usuarios
                SET nombre = ?, email = ?, telefono = ?, direccion = ?, role = ?
                WHERE id = ?
            `;
            
            conexion.query(
                query,
                [nombre, email, telefono || null, direccion || null, role || 'cliente', id],
                (error) => {
                    if (error) {
                        console.error('Error al actualizar usuario:', error);
                        return res.status(500).json({ error: 'Error al actualizar usuario' });
                    }
                    
                    res.json({
                        id,
                        nombre,
                        email,
                        telefono,
                        direccion,
                        role: role || 'cliente'
                    });
                }
            );
        });
    });
});

// Eliminar un usuario (solo para administradores)
router.delete('/usuarios/:id', verifyToken, isAdmin, (req, res) => {
    const { id } = req.params;
    
    // Verificar si el usuario existe
    conexion.query('SELECT id FROM Usuarios WHERE id = ?', [id], (error, resultados) => {
        if (error) {
            console.error('Error al verificar usuario:', error);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Eliminar usuario
        conexion.query('DELETE FROM Usuarios WHERE id = ?', [id], (error) => {
            if (error) {
                console.error('Error al eliminar usuario:', error);
                return res.status(500).json({ error: 'Error al eliminar usuario' });
            }
            
            res.json({ message: 'Usuario eliminado correctamente' });
        });
    });
});

module.exports = router;