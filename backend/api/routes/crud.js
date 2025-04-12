const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const verifyToken = require('./middlewares/verifyToken');
const isAdmin = require('./middlewares/isAdmin');

// Importamos la conexión a la base de datos
const conexion = require('../db/connection');



const fs = require('fs');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'productos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });





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








// Ruta para crear producto
// routes/crud.js (modifica la ruta POST)

// Ruta para obtener el historial de ventas con filtros de fecha
router.get('/ventas/historial', verifyToken, isAdmin, async (req, res) => {
  try {
      const { fechaInicio, fechaFin } = req.query;
      
      let query = `
          SELECT v.*, p.fecha_pedido, p.direccion_envio, p.metodo_pago 
          FROM ventas v
          JOIN pedidos p ON v.pedido_id = p.id
          WHERE 1=1
      `;
      const params = [];

      if (fechaInicio && fechaFin) {
          query += ' AND p.fecha_pedido BETWEEN ? AND ?';
          params.push(fechaInicio, fechaFin + ' 23:59:59');
      }

      const [ventas] = await conexion.promise().query(query, params);
      
      // Obtener detalles de cada venta
      for (const venta of ventas) {
          const [detalles] = await conexion.promise().query(
              'SELECT producto_nombre, cantidad, precio_unitario FROM detalle_pedidos WHERE pedido_id = ?',
              [venta.pedido_id]
          );
          venta.productos = detalles;
      }

      res.json(ventas);
  } catch (error) {
      console.error('Error al obtener historial de ventas:', error);
      res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta para obtener productos más vendidos
// En crud.js 
router.get('/ventas/productos-mas-vendidos', verifyToken, isAdmin, async (req, res) => {
  try {
      const { periodo } = req.query;
      let fechaFiltro = new Date();
      
      switch (periodo) {
        case 'mes': 
          fechaFiltro.setMonth(fechaFiltro.getMonth() - 1);
          break;
        case 'trimestre': 
          fechaFiltro.setMonth(fechaFiltro.getMonth() - 3);
          break;
        case 'semestre': 
          fechaFiltro.setMonth(fechaFiltro.getMonth() - 6);
          break;
        case 'anio': 
          fechaFiltro.setFullYear(fechaFiltro.getFullYear() - 1);
          break;
        default: 
          fechaFiltro = null;
      }

      let query = `
  SELECT 
    dp.producto_id,
    ANY_VALUE(dp.producto_nombre) AS producto_nombre,
    SUM(dp.cantidad) AS total_vendido,
    ANY_VALUE(p.imagen) AS imagen,
    ANY_VALUE(p.precio) AS precio
  FROM detalle_pedidos dp
  JOIN pedidos pe ON dp.pedido_id = pe.id
  JOIN productos p ON dp.producto_id = p.id
  ${fechaFiltro ? 'WHERE pe.fecha_pedido >= ?' : ''}
  GROUP BY dp.producto_id
  ORDER BY total_vendido DESC
  LIMIT 10
`;

      const params = fechaFiltro ? [fechaFiltro.toISOString().split('T')[0]] : [];
      
      const [resultados] = await conexion.promise().query(query, params);
      res.json(resultados);
  } catch (error) {
      console.error('Error al obtener productos más vendidos:', error);
      res.status(500).json({ error: 'Error en el servidor' });
  }
});

















// Ruta para crear producto
router.post('/productos', verifyToken, isAdmin, upload.single('imagen'), (req, res) => {
  console.log('Archivo recibido:', req.file);
  console.log('Datos recibidos:', req.body);
  
  const categoriasPermitidas = [
      'bicicletas',
  'accesorios',
  'repuestos',
  'ropa_deportiva'
  ];

  if (!categoriasPermitidas.includes(req.body.categoria)) {
      return res.status(400).json({ error: 'Categoría no válida' });
  }

  const { file } = req; // Archivo subido
  const { nombre, categoria, marca, disponibilidad, descripcion, caracteristicas } = req.body;

  const precio = parseFloat(req.body.precio);
  const stock = parseInt(req.body.stock) || 0;
    
  // Validación adicional
  if (isNaN(precio)) {
      return res.status(400).json({ error: 'El precio debe ser un número válido' });
  }
  
  if (isNaN(stock) || stock < 0) {
      return res.status(400).json({ error: 'El stock debe ser un número mayor o igual a cero' });
  }

  const productoData = {
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      marca: req.body.marca || null,
      precio: precio,
      stock: stock,
      disponibilidad: req.body.disponibilidad,
      descripcion: req.body.descripcion || null,
      caracteristicas: req.body.caracteristicas || null,
      imagen: req.file ? req.file.filename : 'default.jpg'
  };

  // Validación de campos requeridos
  if (!nombre || !categoria || !precio || !disponibilidad) {
    return res.status(400).json({ error: 'Campos requeridos faltantes' });
  }

  const query = `
    INSERT INTO Productos (nombre, categoria, marca, precio, stock, disponibilidad, descripcion, caracteristicas, imagen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  conexion.query(query, [
    nombre,
    categoria,
    marca || null,
    parseFloat(precio),
    stock,
    disponibilidad,
    descripcion || null,
    caracteristicas || null,
    file ? file.filename : 'default.jpg'
  ], (error, resultados) => {
    if (error) {
      console.error('Error en la consulta SQL:', error);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json({ 
      id: resultados.insertId,
      nombre,
      categoria,
      marca,
      precio,
      stock,
      disponibilidad,
      imagen: file ? file.filename : 'default.jpg'
    });
  });
});

// Ruta para actualizar producto
router.put('/productos/:id', verifyToken, isAdmin, upload.single('imagen'), (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, marca, precio, stock, disponibilidad, descripcion, caracteristicas } = req.body;
  let imagen = req.body.imagen;

  const categoriasPermitidas = [
    'bicicletas',
  'accesorios',
  'repuestos',
  'ropa_deportiva'
  ];

  if (!categoriasPermitidas.includes(req.body.categoria)) {
      return res.status(400).json({ error: 'Categoría no válida' });
  }

  if (req.file) {
    imagen = req.file.filename;
  }

  const query = `
    UPDATE Productos SET
    nombre = ?,
    categoria = ?,
    marca = ?,
    precio = ?,
    stock = ?,
    disponibilidad = ?,
    descripcion = ?,
    caracteristicas = ?,
    imagen = ?
    WHERE id = ?
  `;

  conexion.query(query,
    [nombre, categoria, marca, precio, stock, disponibilidad, descripcion, caracteristicas, imagen, id],
    (error) => {
      if (error) return res.status(500).json({ error: 'Error al actualizar producto' });
      res.json({ success: true });
    }
  );
});

// Ruta para obtener productos con filtros
router.get('/productos', (req, res) => {
  const categoriasValidas = [
      'bicicletas',
  'accesorios',
  'repuestos',
  'ropa_deportiva'
  ];
  
  if (req.query.categoria && !categoriasValidas.includes(req.query.categoria)) {
      return res.status(400).json({ error: 'Categoría no válida' });
  }

  const { categoria } = req.query;
  let query = 'SELECT * FROM Productos';
  const params = [];

  if (categoria) {
    query += ' WHERE categoria = ?';
    params.push(categoria);
  }

  conexion.query(query, params, (error, resultados) => {
    if (error) return res.status(500).json({ error: 'Error al obtener productos' });
    res.json(resultados);
  });
});











// Ruta para filtrar productos (requiere autenticación si es necesario)
router.get('/productos/filtrar', verifyToken, (req, res) => {
  // Extraer parámetros de consulta
  const { categorias, marcas, precios } = req.query;
  let query = "SELECT * FROM Productos";
  const queryParams = [];

  const conditions = [];

  // Filtrar por categorías si se envían
  if (categorias) {
    const cats = categorias.split(",");
    conditions.push(`categoria IN (${cats.map(() => "?").join(",")})`);
    queryParams.push(...cats);
  }

  // Filtrar por marcas si se envían
  if (marcas) {
    const brandList = marcas.split(",");
    conditions.push(`marca IN (${brandList.map(() => "?").join(",")})`);
    queryParams.push(...brandList);
  }

  // Filtrar por rangos de precios (ejemplo simple: se espera un string que se pueda transformar a condiciones)
  if (precios) {
    const priceRanges = precios.split(",");
    // Aquí se puede implementar lógica para cada rango; a título de ejemplo:
    // Si se envía "$0 - $50", se asume que los precios están en una escala establecida
    priceRanges.forEach(range => {
      if (range.includes("$0 - $50")) {
        conditions.push("precio BETWEEN ? AND ?");
        queryParams.push(0, 50);
      } else if (range.includes("$50 - $100")) {
        conditions.push("precio BETWEEN ? AND ?");
        queryParams.push(50, 100);
      } else if (range.includes("$100 - $200")) {
        conditions.push("precio BETWEEN ? AND ?");
        queryParams.push(100, 200);
      } else if (range.includes("$200+")) {
        conditions.push("precio >= ?");
        queryParams.push(200);
      }
    });
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  conexion.query(query, queryParams, (error, resultados) => {
    if (error) {
      console.error("Error al filtrar productos:", error);
      return res.status(500).json({ error: "Error en la consulta de filtrado" });
    }
    res.json(resultados);
  });
});











// Rutas CRUD


// // Crear un nuevo registro (Solo administradores)
// router.post('/:tabla', verifyToken, isAdmin, async (req, res) => {
//   try {
//     const resultado = await crear(req.params.tabla, req.body);
//     res.send(resultado);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });







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
    const { producto_id, producto_nombre, precio, imagen, cantidad } = req.body; // Añade producto_nombre

    const query = `
      INSERT INTO Carrito 
      (usuario_id, producto_id, producto_nombre, producto_precio, producto_imagen, cantidad)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE cantidad = ?
    `;

    conexion.query(
      query,
      [userId, producto_id, producto_nombre, precio, imagen, cantidad, cantidad], // Añade producto_nombre
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




router.get('/productos/validar/:id', (req, res) => {
  conexion.query(
    'SELECT id FROM Productos WHERE id = ?',
    [req.params.id],
    (error, resultados) => {
      if (error || resultados.length === 0) {
        return res.status(404).json({ valido: false });
      }
      res.json({ valido: true });
    }
  );
});




router.post('/checkout', verifyToken, async (req, res) => {
  const userId = req.userId; // Modificado: usar req.userId en lugar de req.user.id
  const { direccion, metodo_pago, notas, info_contacto, items, total } = req.body;

  console.log('Recibido checkout con items:', items);

  // Validar que hay items en el carrito
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  // Validar campos obligatorios
  if (!direccion) {
    return res.status(400).json({ error: 'La dirección de envío es obligatoria' });
  }

  if (!metodo_pago) {
    return res.status(400).json({ error: 'El método de pago es obligatorio' });
  }

  try {
    // Iniciar transacción para asegurar integridad de datos
    await conexion.promise().beginTransaction();

    // 1. Crear el pedido
    const pedidoQuery = `
      INSERT INTO pedidos 
      (usuario_id, direccion_envio, metodo_pago, total, notas, info_contacto)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [pedidoResult] = await conexion.promise().query(pedidoQuery, [
      userId,
      direccion,
      metodo_pago,
      total || 0,
      notas || null,
      info_contacto ? JSON.stringify(info_contacto) : null
    ]);

    const pedidoId = pedidoResult.insertId;

    // 2. Crear detalles del pedido
    if (items.length > 0) {
      const detalleQuery = `
        INSERT INTO detalle_pedidos 
        (pedido_id, producto_id, producto_nombre, cantidad, precio_unitario, subtotal)
        VALUES ?
      `;
      
      const detalleValues = items.map(item => [
        pedidoId,
        item.id || null,
        item.nombre,
        item.cantidad || 1,
        parseFloat(item.precio) || 0,
        (parseFloat(item.precio) || 0) * (item.cantidad || 1)
      ]);

      await conexion.promise().query(detalleQuery, [detalleValues]);
    }

    // 3. Crear registro de venta
    const ventaQuery = `
      INSERT INTO ventas 
      (pedido_id, monto_total, impuestos, monto_neto)
      VALUES (?, ?, ?, ?)
    `;
    
    const impuestos = total * 0.19;
    const neto = total - impuestos;
    
    await conexion.promise().query(ventaQuery, [
      pedidoId,
      total || 0,
      impuestos || 0,
      neto || 0
    ]);

    // 4. Vaciar carrito
    await conexion.promise().query('DELETE FROM Carrito WHERE usuario_id = ?', [userId]);

    // Confirmar transacción
    await conexion.promise().commit();

    res.json({
      success: true,
      orderId: pedidoId,
      total: total || 0
    });

  } catch (error) {
    // Revertir transacción en caso de error
    await conexion.promise().rollback();
    console.error('Error en checkout:', error);
    res.status(500).json({ error: 'Error al procesar el pedido', details: error.message });
  }
});



// === Rutas CRUD genéricas ===

// Definir un array de tablas permitidas para las rutas CRUD genéricas
const tablasPermitidas = ['Productos', 'Carrito', 'Favoritos', 'pedidos', 'detalle_pedidos', 'ventas'];



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
