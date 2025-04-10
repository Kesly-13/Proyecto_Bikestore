// routes/checkout.js
const express = require('express');
const router = express.Router();
const verifyToken = require('./middlewares/verifyToken');
const conexion = require('../db/connection');

router.post('/checkout', verifyToken, (req, res) => {
  // Obtener el ID del usuario desde el token decodificado
  const usuario_id = req.userId; // Asumiendo que verifyToken pone el ID aquí
  
  if (!usuario_id) {
    console.log('Usuario no identificado en el token');
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  console.log('Procesando checkout para usuario:', usuario_id);
  console.log('Datos recibidos:', req.body);
  
 // checkout.js (backend)
const { direccion_envio, metodo_pago, notas, productos, info_contacto } = req.body;

// Validación mínima (agrega más si es necesario)
if (!direccion_envio || !metodo_pago || !productos || productos.length === 0) {
  return res.status(400).json({ error: "Campos incompletos" });
}
  
  // Cálculo de totales basado en los productos
  let subtotal = 0;
  productos.forEach(p => {
    subtotal += p.precio_unitario * p.cantidad;
  });
  const shipping = 12000; // Costo de envío
  const tax = subtotal * 0.19; // IVA 19%
  const total = subtotal + shipping + tax;

  // Insertar registro en pedidos
  const pedidoQuery = `
    INSERT INTO pedidos (usuario_id, direccion_envio, metodo_pago, total, notas, info_contacto)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  conexion.query(
    pedidoQuery, 
    [usuario_id, direccion_envio, metodo_pago, total, notas, JSON.stringify(info_contacto)], 
    (err, resultadoPedido) => {
      if (err) {
        console.error("Error al insertar pedido:", err);
        return res.status(500).json({ error: 'Error al crear pedido' });
      }
      
      const pedido_id = resultadoPedido.insertId;
      console.log('Pedido creado con ID:', pedido_id);

      // Insertar productos en detalle_pedidos
const detalles = [];
let errorEnProductos = false;

// Usar Promise.all para manejar todas las inserciones de manera asíncrona
const promesasDetalles = productos.map(p => {
  return new Promise((resolve, reject) => {
    // Validar que el producto_id sea válido
    if (!p.producto_id) {
      console.error("Producto sin ID válido:", p);
      errorEnProductos = true;
      return resolve(false);
    }
    
    const productoSubtotal = p.precio_unitario * p.cantidad;
    const detalleQuery = `
      INSERT INTO detalle_pedidos (
        pedido_id, 
        producto_id,
        cantidad, 
        precio_unitario, 
        subtotal
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    conexion.query(detalleQuery, [
      pedido_id, 
      p.producto_id,
      p.cantidad, 
      p.precio_unitario, 
      productoSubtotal
    ], (err2) => {
      if (err2) {
        console.error("Error al insertar detalle_pedidos:", err2);
        reject(err2);
      } else {
        detalles.push({
          producto: p.producto_nombre,
          cantidad: p.cantidad,
          precio: p.precio_unitario,
          subtotal: productoSubtotal
        });
        resolve(true);
      }
    });
  });
});

Promise.all(promesasDetalles)
  .then(() => {
    if (errorEnProductos) {
      return res.status(400).json({ 
        error: 'Algunos productos no tienen ID válido'
      });
    }
    
    // Responder al frontend
    return res.json({ 
      message: 'Compra exitosa', 
      pedido_id,
      detalles,
      total
    });
  })
  .catch(error => {
    console.error("Error al procesar detalles de pedido:", error);
    return res.status(500).json({ 
      error: 'Error al procesar los detalles del pedido'
    });
  });
}
);
});

module.exports = router;