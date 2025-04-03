// cart.js

import { mostrarMensaje } from './ui.js';
import { actualizarCarritoEnBD } from './syncManager.js';




export function initCarrito() {
  // Seleccionar tanto botones con clase add-to-cart como release-button
  document.querySelectorAll('.add-to-cart, .release-button').forEach(button => {
    button.addEventListener('click', () => {
      // Determinar si es una tarjeta de producto o una de release
      const productCard = button.closest('.product-card, .release-card');
      const productName = productCard.querySelector('.product-title, .release-title').textContent;
      const productPrice = productCard.querySelector('.product-price, .release-price').textContent;
      const productImage = productCard.querySelector('img')?.src || '';

      // Llamar a la función para agregar al carrito
      agregarAlCarrito(productName, productPrice, productImage);
      console.log(`Producto agregado: ${productName}`);
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


export function agregarAlCarrito(nombre, precio, imagen) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const productoExistente = carrito.find(item => item.nombre === nombre);

  if (productoExistente) {
    mostrarMensaje("El producto ya está en el carrito");
    return;
  }

  const nuevoItem = {
    nombre,
    precio,
    imagen,
    cantidad: 1
  };

  carrito.push(nuevoItem);

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
  mostrarMensaje("¡Producto agregado al carrito!");

  // Intentar actualizar en base de datos si hay sesión activa
  actualizarCarritoEnBD(nuevoItem, 'agregar');
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
    // Calcula el total considerando la cantidad de cada producto
    const precioNumerico = parseInt(producto.precio.replace(/[^\d]/g, ""));
    total += precioNumerico * (producto.cantidad || 1);

    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";

    itemDiv.innerHTML = `
      <div class="item-details">
        <h4>${producto.nombre}</h4>
        <p>${producto.precio}</p>
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
    <a href="carrito.html" class="checkout-btn">Finalizar compra</a>`;

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