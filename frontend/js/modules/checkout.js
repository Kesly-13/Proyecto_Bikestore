// frontend/js/modules/checkout.js

import { apiRequest } from './api.js';
import { mostrarMensaje } from './ui.js';

document.addEventListener('DOMContentLoaded', function() {
  // Cargar productos del carrito en el resumen
  cargarResumenPedido();
  
  // Manejar cambios en el método de pago
  document.querySelectorAll('input[name="metodo_pago"]').forEach(radio => {
    radio.addEventListener('change', mostrarCamposPago);
  });
  
  // Manejar envío del formulario
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', procesarCheckout);
  }
});

function mostrarCamposPago() {
  // Ocultar todos los campos de pago
  document.querySelectorAll('.payment-details').forEach(div => {
    div.style.display = 'none';
  });
  
  // Mostrar los campos correspondientes al método seleccionado
  const metodoPago = document.querySelector('input[name="metodo_pago"]:checked')?.value;
  if (metodoPago === 'tarjeta') {
    document.getElementById('tarjeta-fields').style.display = 'block';
  } else if (metodoPago === 'pse') {
    document.getElementById('pse-fields').style.display = 'block';
  }
}

function cargarResumenPedido() {
  const orderItems = document.getElementById('order-items');
  const subtotalElement = document.getElementById('subtotal');
  const taxElement = document.getElementById('tax');
  const totalElement = document.getElementById('total');
  
  if (!orderItems) return;
  
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  let subtotal = 0;
  
  // Limpiar contenedor
  orderItems.innerHTML = '';
  
  carrito.forEach(producto => {
    const precioNumerico = parseInt(producto.precio.replace(/[^\d]/g, ""));
    const cantidad = producto.cantidad || 1;
    subtotal += precioNumerico * cantidad;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    
    itemDiv.innerHTML = `
      <div class="item-image">
        <img src="${producto.imagen || '/frontend/static/placeholder.jpg'}" alt="${producto.nombre}">
      </div>
      <div class="item-info">
        <h4>${producto.nombre}</h4>
        <p>${producto.precio} × ${cantidad}</p>
      </div>
    `;
    
    orderItems.appendChild(itemDiv);
  });
  
  const shipping = 12000; // Costo fijo de envío
  const tax = Math.round(subtotal * 0.19); // IVA 19%
  const total = subtotal + shipping + tax;
  
  if (subtotalElement) subtotalElement.textContent = `COP $${subtotal.toLocaleString()}`;
  if (taxElement) taxElement.textContent = `COP $${tax.toLocaleString()}`;
  if (totalElement) totalElement.textContent = `COP $${total.toLocaleString()}`;
}





async function procesarCheckout(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    mostrarMensaje('Debes iniciar sesión para realizar una compra', 3000);
    const modalLogin = document.getElementById('modal-login');
    if (modalLogin) modalLogin.style.display = 'block';
    return;
  }
  
  // Recopilar datos del formulario
  const form = event.target;
  const nombre = form.nombre.value;
  const email = form.email.value;
  const telefono = form.telefono.value;
  const direccion = form.direccion.value;
  const ciudad = form.ciudad.value;
  const departamento = form.departamento.value;
  const metodoPago = document.querySelector('input[name="metodo_pago"]:checked')?.value;
  const notas = form.notas.value;
  
  // Validar datos mínimos
  if (!nombre || !email || !telefono || !direccion || !ciudad || !departamento || !metodoPago) {
    mostrarMensaje('Por favor completa todos los campos obligatorios', 3000);
    return;
  }
  
  // Preparar productos del carrito
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  // Verificar que todos los productos tengan ID
  const todosProductosTienenId = carrito.every(item => item.id);
  if (!todosProductosTienenId) {
    mostrarMensaje('Error: Algunos productos no tienen ID válido', 3000);
    console.error('Carrito con productos sin ID:', carrito);
    return;
  }
  
  // Calcular totales
  let subtotal = 0;
  carrito.forEach(item => {
    const precio = parseInt(item.precio.replace(/[^\d]/g, ""));
    const cantidad = item.cantidad || 1;
    subtotal += precio * cantidad;
  });
  
  const shipping = 12000; 
  const tax = Math.round(subtotal * 0.19); 
  const total = subtotal + shipping + tax;
  
  const checkoutData = {
    direccion_envio: `${direccion}, ${ciudad}, ${departamento}`,
    metodo_pago: metodoPago,
    notas: notas,
    productos: carrito.map(item => ({
      producto_id: parseInt(item.id) || 0, // Convertir a número y asegurar valor por defecto
      cantidad: item.cantidad || 1,
      precio_unitario: parseInt(item.precio.replace(/[^\d]/g, "")),
      producto_nombre: item.nombre
    })),
    info_contacto: {
      nombre,
      email,
      telefono
    }
  };
  
  try {
    // Enviar datos al backend
    const response = await apiRequest('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al procesar la compra');
    }
    
    const data = await response.json();
    
    // Mostrar modal de confirmación
    mostrarConfirmacion({
      ordenId: data.pedido_id,
      metodoPago: metodoPago,
      direccion: `${direccion}, ${ciudad}, ${departamento}`,
      total: document.getElementById('total').textContent
    });
    
    // Limpiar carrito
    localStorage.setItem('carrito', JSON.stringify([]));
    
  } catch (error) {
    console.error('Error en checkout:', error);
    mostrarMensaje(error.message || 'Error al procesar la compra. Intenta de nuevo.', 5000);
  }
}




function mostrarConfirmacion(data) {
  const modal = document.getElementById('confirmation-modal');
  
  if (modal) {
    document.getElementById('order-number').textContent = data.ordenId;
    document.getElementById('payment-method').textContent = traducirMetodoPago(data.metodoPago);
    document.getElementById('shipping-address').textContent = data.direccion;
    document.getElementById('confirmation-total').textContent = data.total;
    
    modal.style.display = 'block';
    
    // Cerrar modal al hacer clic en X
    modal.querySelector('.close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
}

function traducirMetodoPago(metodo) {
  const traducciones = {
    'tarjeta': 'Tarjeta de crédito/débito',
    'pse': 'PSE',
    'efectivo': 'Pago contra-entrega'
  };
  
  return traducciones[metodo] || metodo;
}