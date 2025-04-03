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







// crud.js (modificar/agregar estas rutas)

// Rutas para el carrito
// Obtener carrito de un usuario
router.get('/cart/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const query = 'SELECT * FROM Carrito WHERE usuario_id = ?';

    conexion.query(query, [userId], (error, resultados) => {
      if (error) {
        console.error(error);
        return res.status(500).send(error);
      }
      res.json(resultados);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Añadir producto al carrito
router.post('/cart/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { producto_nombre, precio, imagen, cantidad } = req.body;

    const query = `
      INSERT INTO Carrito (usuario_id, producto_nombre, producto_precio, producto_imagen, cantidad)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE cantidad = ?
    `;

    conexion.query(
      query,
      [userId, producto_nombre, precio, imagen, cantidad, cantidad],
      (error, resultado) => {
        if (error) {
          console.error(error);
          return res.status(500).send(error);
        }
        res.json({ message: 'Producto agregado al carrito', id: resultado.insertId });
      }
    );
  } catch (error) {
    res.status(500).send(error);
  }
});

// Eliminar producto del carrito
router.delete('/cart/:userId/:productoNombre', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const productoNombre = req.params.productoNombre;

    const query = 'DELETE FROM Carrito WHERE usuario_id = ? AND producto_nombre = ?';

    conexion.query(query, [userId, productoNombre], (error, resultado) => {
      if (error) {
        console.error(error);
        return res.status(500).send(error);
      }
      res.json({ message: 'Producto eliminado del carrito' });
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Rutas para favoritos
// Obtener favoritos de un usuario
router.get('/favorites/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const query = 'SELECT * FROM Favoritos WHERE usuario_id = ?';

    conexion.query(query, [userId], (error, resultados) => {
      if (error) {
        console.error(error);
        return res.status(500).send(error);
      }
      res.json(resultados);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Añadir producto a favoritos
router.post('/favorites/:userId', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { producto_nombre, precio, imagen } = req.body;

    const query = `
      INSERT INTO Favoritos (usuario_id, producto_nombre, producto_precio, producto_imagen)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE producto_precio = ?, producto_imagen = ?
    `;

    conexion.query(
      query,
      [userId, producto_nombre, precio, imagen, precio, imagen],
      (error, resultado) => {
        if (error) {
          console.error(error);
          return res.status(500).send(error);
        }
        res.json({ message: 'Producto agregado a favoritos', id: resultado.insertId });
      }
    );
  } catch (error) {
    res.status(500).send(error);
  }
});

// Eliminar producto de favoritos
router.delete('/favorites/:userId/:productoNombre', verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const productoNombre = req.params.productoNombre;

    const query = 'DELETE FROM Favoritos WHERE usuario_id = ? AND producto_nombre = ?';

    conexion.query(query, [userId, productoNombre], (error, resultado) => {
      if (error) {
        console.error(error);
        return res.status(500).send(error);
      }
      res.json({ message: 'Producto eliminado de favoritos' });
    });
  } catch (error) {
    res.status(500).send(error);
  }
});




module.exports = router;
