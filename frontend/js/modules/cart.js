// cart.js

import { mostrarMensaje } from './ui.js';
import { actualizarCarritoEnBD } from './syncManager.js';



export function initCarrito() {
  document.querySelectorAll('.add-to-cart, .release-button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productCard = this.closest('.product-card, .release-card');
      
      // Obtener datos incluyendo el ID
      const productId = button.getAttribute('data-id'); // 🆕 Nueva línea
      const productName = productCard.querySelector('.product-title, .release-title').textContent;
      const productPrice = productCard.querySelector('.product-price, .release-price').textContent;
      const productImage = productCard.querySelector('img')?.src || '';

      // Pasar el ID al carrito
      agregarAlCarrito({ 
        id: productId,
        nombre: productName,
        precio: productPrice,
        imagen: productImage
      });
    });
  });
}

export function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const totalCantidad = carrito.reduce((suma, item) => suma + (item.cantidad || 1), 0);
  const badge = document.querySelector(".cart-icon .badge");
  if (badge) {
    badge.textContent = totalCantidad;
  }
}


// Función para agregar productos al carrito
export function agregarAlCarrito(producto) {
  // Obtener el carrito actual
  if (!producto.id) {
    mostrarMensaje('Error: Producto no válido', 3000);
    throw new Error('El producto no tiene un ID válido');
  }
  
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  
  // Asegurarnos de que el producto tenga un ID
  if (!producto.id) {
    console.error('Advertencia: Producto sin ID detectado', producto);
    // Si no hay ID, podemos intentar generar uno temporal o rechazar la adición
    // En un escenario real, todos los productos deberían tener ID desde la base de datos
  }
  
  // Verificar si el producto ya está en el carrito
  const productoExistente = carrito.findIndex(item => item.id === producto.id);

  if (productoExistente !== -1) {
    carrito[productoExistente].cantidad += 1;
    mostrarMensaje(`${producto.nombre} ya está en el carrito (${carrito[productoExistente].cantidad} unidades)`, 2000); // Mensaje actualizado
  } else {
    carrito.push({ ...producto, cantidad: 1 });
    mostrarMensaje(`${producto.nombre} agregado al carrito`, 2000); // Mensaje nuevo
  }

  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
  
  // Guardar el carrito actualizado
  localStorage.setItem('carrito', JSON.stringify(carrito));
  
  // Actualizar el contador del carrito en la UI
  actualizarContadorCarrito();
  
  // Sincronizar con la base de datos si hay un usuario logueado
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // Decodificar el token para obtener el ID del usuario
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id;
      
      // Actualizar en la base de datos
      actualizarCarritoEnBD({
        id: producto.id, // Incluir ID aquí también
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        cantidad: 1
      }, 'agregar');
    } catch (error) {
      console.error('Error al sincronizar con BD:', error);
    }
  }
  
  return carrito;
}

export function actualizarCarritoModal() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItemsContainer || !cartTotal) return;

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let total = 0;
  cartItemsContainer.innerHTML = "";

  if (carrito.length === 0) {
    cartItemsContainer.innerHTML = "<p>Tu carrito está vacío</p>";
    cartTotal.innerHTML = "Total: COP $0";
    return;
  }

  carrito.forEach((producto, index) => {
    // Verificar que el precio esté definido
    const precioNumerico = producto.precio ? parseInt(producto.precio.replace(/[^\d]/g, "")) : 0;
    total += precioNumerico * (producto.cantidad || 1);

    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    itemDiv.innerHTML = `
      <div class="item-details">
        <h4>${producto.nombre}</h4>
        <p>${producto.precio || 'Precio no disponible'}</p>
        <div class="quantity-controls">
          <button class="decrement" data-index="${index}">-</button>
          <span class="quantity">${producto.cantidad || 1}</span>
          <button class="increment" data-index="${index}">+</button>
        </div>
      </div>
      <button class="remove-item" data-index="${index}">×</button>
    `;

    cartItemsContainer.appendChild(itemDiv);
  });

  cartTotal.innerHTML = `<strong>Total: COP $${total.toLocaleString()}</strong>
    <a href="/frontend/compra.html" class="checkout-btn">Finalizar compra</a>`;

  // Agregar event listener para eliminar productos (asegurando que no se cierre el modal)
  document.querySelectorAll(".remove-item").forEach(button => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      eliminarDelCarrito(parseInt(this.dataset.index));
    });
  });

  // Agregar event listener para incrementar cantidad
  document.querySelectorAll(".increment").forEach(button => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      incrementarCantidad(parseInt(this.dataset.index));
    });
  });

  // Agregar event listener para decrementar cantidad
  document.querySelectorAll(".decrement").forEach(button => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      decrementarCantidad(parseInt(this.dataset.index));
    });
  });
}

export function incrementarCantidad(index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carrito[index]) {
    carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;

    // Intentar actualizar en BD
    actualizarCarritoEnBD(carrito[index], 'actualizar');
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarritoModal();
  actualizarContadorCarrito();
}

export function decrementarCantidad(index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carrito[index]) {
    carrito[index].cantidad = (carrito[index].cantidad || 1) - 1;

    // Si la cantidad baja de 1, se puede eliminar el producto del carrito
    if (carrito[index].cantidad < 1) {
      // Guardar referencia antes de eliminar
      const itemEliminado = carrito[index];
      carrito.splice(index, 1);

      // Actualizar en BD que se eliminó
      actualizarCarritoEnBD(itemEliminado, 'eliminar');
    } else {
      // Si solo se decrementó, actualizar en BD
      actualizarCarritoEnBD(carrito[index], 'actualizar');
    }
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarritoModal();
  actualizarContadorCarrito();
}


export function eliminarDelCarrito(index) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const itemEliminado = carrito[index]; // Guardamos referencia al item que eliminaremos
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  actualizarCarritoModal();
  actualizarContadorCarrito();

  // Intentar actualizar en base de datos si hay sesión activa
  actualizarCarritoEnBD(itemEliminado, 'eliminar');
}