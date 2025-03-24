// crud.js
const express = require('express');
const router = express.Router();

const verifyToken = require('./middlewares/verifyToken');
const isAdmin = require('./middlewares/isAdmin');

// Importamos la conexión a la base de datos
const conexion = require('../db/connection');


// Función para obtener todos los registros de una tabla
function obtenerTodos(tabla) {
  return new Promise((resolve, reject) => {
    conexion.query(`SELECT * FROM ${tabla}`, (error, resultados) => {
      if (error) reject(error);
      else resolve(resultados);
    });
  });
}

// Función para obtener un registro por su ID
function obtenerUno(tabla, id) {
  return new Promise((resolve, reject) => {
    conexion.query(`SELECT * FROM ${tabla} WHERE id = ?`, [id], (error, resultado) => {
      if (error) reject(error);
      else resolve(resultado);
    });
  });
}

// Función para crear un registro
function crear(tabla, data) {
  return new Promise((resolve, reject) => {
    conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, resultado) => {
      if (error) reject(error);
      else {
        Object.assign(data, { id: resultado.insertId });
        resolve(data);
      }
    });
  });
}

// Función para actualizar un registro por su ID
function actualizar(tabla, id, data) {
  return new Promise((resolve, reject) => {
    conexion.query(`UPDATE ${tabla} SET ? WHERE id = ?`, [data, id], (error, resultado) => {
      if (error) reject(error);
      else resolve(resultado);
    });
  });
}

// Función para eliminar un registro por su ID
function eliminar(tabla, id) {
  return new Promise((resolve, reject) => {
    conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, [id], (error, resultado) => {
      if (error) reject(error);
      else resolve(resultado);
    });
  });
}

// Rutas CRUD

// Obtener todos los registros de una tabla (Solo usuarios autenticados)
router.get('/:tabla', verifyToken, async (req, res) => {
  try {
    const resultados = await obtenerTodos(req.params.tabla);
    res.send(resultados);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Obtener un registro por ID (Solo usuarios autenticados)
router.get('/:tabla/:id', verifyToken, async (req, res) => {
  try {
    const resultado = await obtenerUno(req.params.tabla, req.params.id);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Crear un nuevo registro (Solo administradores)
router.post('/:tabla', verifyToken, isAdmin, async (req, res) => {
  try {
    const resultado = await crear(req.params.tabla, req.body);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Actualizar un registro por ID (Solo administradores)
router.put('/:tabla/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const resultado = await actualizar(req.params.tabla, req.params.id, req.body);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Eliminar un registro por ID (Solo administradores)
router.delete('/:tabla/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const resultado = await eliminar(req.params.tabla, req.params.id);
    res.send(resultado);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
