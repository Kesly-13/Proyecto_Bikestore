// console.log("script.js cargado");

// /* ============================================================
//    Funciones Auxiliares y de Componentes
//    ============================================================ */

// // Función para asignar el listener del login (se carga luego del header)
// function attachLoginListener() {
//   const loginIcon = document.getElementById("loginIcon");
//   if (!loginIcon) return;
  
//   loginIcon.addEventListener("click", function() {
//     console.log("Se hizo clic en loginIcon");
//     fetch('./login.html')
//       .then(response => {
//         if (!response.ok) {
//           throw new Error("Error al cargar login.html");
//         }
//         return response.text();
//       })
//       .then(data => {
//         const modalContainer = document.createElement("div");
//         modalContainer.innerHTML = data;
//         document.body.appendChild(modalContainer);
        
//         const loginModal = modalContainer.querySelector(".login-modal");
//         if (!loginModal) {
//           console.error("No se encontró el elemento .login-modal en el contenido cargado");
//           return;
//         }
//         loginModal.style.display = "flex";
//         console.log("Modal mostrado");
        
//         // Cerrar con la X
//         const closeButton = loginModal.querySelector(".close-button");
//         if (closeButton) {
//           closeButton.addEventListener("click", () => {
//             modalContainer.remove();
//             console.log("Modal cerrado con la X");
//           });
//         } else {
//           console.warn("No se encontró el botón de cierre (.close-button)");
//         }
        
//         // Cerrar al hacer clic fuera del contenido
//         loginModal.addEventListener("click", (event) => {
//           if (event.target === loginModal) {
//             modalContainer.remove();
//             console.log("Modal cerrado al hacer clic fuera del contenido");
//           }
//         });
        
//         // Alternar entre Sign In y Register
//         const signUpButton = loginModal.querySelector("#signUpButton");
//         const signInButton = loginModal.querySelector("#signInButton");
//         const signInContainer = loginModal.querySelector("#signIn");
//         const signUpContainer = loginModal.querySelector("#signup");
        
//         if (signUpButton && signInContainer && signUpContainer) {
//           signUpButton.addEventListener("click", function(e) {
//             e.preventDefault();
//             console.log("Cambiando a Register");
//             signInContainer.style.display = "none";
//             signUpContainer.style.display = "block";
//           });
//         }
//         if (signInButton && signInContainer && signUpContainer) {
//           signInButton.addEventListener("click", function(e) {
//             e.preventDefault();
//             console.log("Cambiando a Sign In");
//             signUpContainer.style.display = "none";
//             signInContainer.style.display = "block";
//           });
//         }
//       })
//       .catch(error => console.error("Error loading login modal:", error));
//   });
// }

// // Función para asignar el listener del ícono de favoritos (se llama tras cargar el header)
// function attachFavoritesListener() {
//   const favIcon = document.getElementById("favoritesIcon");
  
//   if (favIcon) {
//     favIcon.addEventListener("click", function() {
//       const favModal = document.getElementById("favorites-modal");
      
//       if (favModal) {
//         // Forzar un reflow del DOM antes de cambiar la clase
//         void favModal.offsetWidth;
        
//         favModal.classList.toggle("active");
        
//         // Verificar visualmente el cambio
//         console.log("Estado del modal:", favModal.classList.contains("active"));
        
//         // Si está activo, cargar los favoritos
//         if (favModal.classList.contains("active")) {
//           cargarFavoritosEnModal();
          
//           // Establecer manualmente la propiedad right como respaldo
//           setTimeout(() => {
//             favModal.style.right = "0px";
//           }, 10);
//         } else {
//           // Si no está activo, volver a la posición inicial
//           setTimeout(() => {
//             favModal.style.right = "-350px";
//           }, 10);
//         }
//       }
//     });
//   }
// }


// /* ============================================================
//    Funciones de Carrito
//    ============================================================ */

// // Inicializa el carrito agregando eventos a los botones de "Agregar al carrito"
// function initCarrito() {
//   document.querySelectorAll('.add-to-cart').forEach(button => {
//     button.addEventListener('click', () => {
//       const productCard = button.closest('.product-card');
//       const productName = productCard.querySelector('h2').textContent;
//       const productPrice = productCard.querySelector('.price').textContent;
//       const producto = { nombre: productName, precio: productPrice };

//       let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
//       carrito.push(producto);
//       localStorage.setItem('carrito', JSON.stringify(carrito));

//       // Actualizar contador del carrito en el header
//       const badge = document.querySelector('.cart-icon .badge');
//       if (badge) {
//         badge.textContent = carrito.length;
//       }
//       console.log(`Producto agregado: ${productName}`);
//     });
//   });
// }

// function actualizarContadorCarrito() {
//   const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//   const badge = document.querySelector(".cart-icon .badge");
//   if (badge) {
//     badge.textContent = carrito.length;
//   }
// }

// function agregarAlCarrito(nombre, precio, imagen) {
//   let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  
//   carrito.push({
//     nombre: nombre,
//     precio: precio,
//     imagen: imagen
//   });
  
//   localStorage.setItem("carrito", JSON.stringify(carrito));
//   actualizarContadorCarrito();
  
//   // Mostrar mensaje de confirmación
//   mostrarMensaje("¡Producto agregado al carrito!");
// }

// function actualizarCarritoModal() {
//   const cartItemsContainer = document.getElementById("cart-items");
//   const cartTotal = document.getElementById("cart-total");
  
//   if (!cartItemsContainer || !cartTotal) return;
  
//   const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//   let total = 0;
  
//   cartItemsContainer.innerHTML = "";
  
//   if (carrito.length === 0) {
//     cartItemsContainer.innerHTML = "<p>Tu carrito está vacío</p>";
//     cartTotal.innerHTML = "Total: COP $0";
//     return;
//   }
  
//   carrito.forEach((producto, index) => {
//     const itemDiv = document.createElement("div");
//     itemDiv.className = "cart-item";
    
//     // Extraer valor numérico del precio
//     const precioNumerico = parseInt(producto.precio.replace(/[^\d]/g, ""));
//     total += precioNumerico;
    
//     itemDiv.innerHTML = `
//       <div class="item-details">
//         <h4>${producto.nombre}</h4>
//         <p>${producto.precio}</p>
//       </div>
//       <button class="remove-item" data-index="${index}">×</button>
//     `;
    
//     cartItemsContainer.appendChild(itemDiv);
//   });
  
//   cartTotal.innerHTML = `<strong>Total: COP $${total.toLocaleString()}</strong>
//     <a href="carrito.html" class="checkout-btn">Finalizar compra</a>`;
  
//   // Agregar eventos para eliminar productos
//   document.querySelectorAll(".remove-item").forEach(button => {
//     button.addEventListener("click", function() {
//       eliminarDelCarrito(parseInt(this.dataset.index));
//     });
//   });
// }

// function eliminarDelCarrito(index) {
//   let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//   carrito.splice(index, 1);
//   localStorage.setItem("carrito", JSON.stringify(carrito));
  
//   actualizarCarritoModal();
//   actualizarContadorCarrito();
// }

// /* ============================================================
//    Funciones de Filtros
//    ============================================================ */

// function filtrarProductos() {
//   const categoriaSeleccionada = document.getElementById('filtro-categoria').value;
//   const precioInput = document.getElementById('filtro-precio').value;
//   const precioMaximo = parseFloat(precioInput.replace(/[^0-9]/g, '')); // Elimina caracteres no numéricos
//   const productos = document.querySelectorAll('.product-card');
//   let productosVisibles = 0;
  
//   productos.forEach(card => {
//     const categoria = card.getAttribute('data-categoria');
//     const precio = parseFloat(card.getAttribute('data-precio'));
//     const cumpleCategoria = (categoriaSeleccionada === 'todos' || categoria === categoriaSeleccionada);
//     const cumplePrecio = (isNaN(precioMaximo) || precio <= precioMaximo);
  
//     if (cumpleCategoria && cumplePrecio) {
//       card.style.display = 'block';
//       productosVisibles++;
//     } else {
//       card.style.display = 'none';
//     }
//   });
  
//   // Mostrar mensaje si no hay resultados
//   let noResults = document.querySelector('.no-results');
//   if (!noResults) {
//     noResults = document.createElement('div');
//     noResults.className = 'no-results';
//     noResults.textContent = 'No se encontraron productos con estos filtros.';
//     document.querySelector('.product-grid').appendChild(noResults);
//   }
//   noResults.style.display = productosVisibles === 0 ? 'block' : 'none';
// }

// /* ============================================================
//    Funciones de Favoritos
//    ============================================================ */

// function activarBotonesFavoritos() {
//   // Selecciona todos los íconos de favoritos en las tarjetas
//   const favIcons = document.querySelectorAll(".favorite-icon");
  
//   favIcons.forEach(icon => {
//     // Obtener la tarjeta padre (release o product)
//     const card = icon.closest(".release-card, .product-card");
//     if (!card) return;
    
//     const productTitle = card.querySelector(".release-title, .product-title").textContent;
//     const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
//     const esFavorito = favoritos.some(item => item.nombre === productTitle);
    
//     // Actualiza el ícono según el estado
//     if (esFavorito) {
//       icon.classList.remove("far");
//       icon.classList.add("fas");
//     } else {
//       icon.classList.remove("fas");
//       icon.classList.add("far");
//     }
    
//     // Agregar evento para marcar/desmarcar favorito
//     icon.addEventListener("click", function(e) {
//       e.stopPropagation();
//       toggleFavorito(card);
//     });
//   });
// }

// function toggleFavorito(productoCard) {
//   const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
//   const titulo = productoCard.querySelector(".release-title, .product-title").textContent;
//   const precio = productoCard.querySelector(".release-price, .product-price").textContent;
//   const imagen = productoCard.querySelector(".release-image img, .product-image img")?.src || "";
//   const favIcon = productoCard.querySelector(".favorite-icon");
  
//   const index = favoritos.findIndex(item => item.nombre === titulo);
  
//   if (index === -1) {
//     // Agregar a favoritos
//     favoritos.push({
//       nombre: titulo,
//       precio: precio,
//       imagen: imagen
//     });
//     if (favIcon) {
//       favIcon.classList.remove("far");
//       favIcon.classList.add("fas");
//     }
//     mostrarMensaje("¡Producto agregado a favoritos!");
//   } else {
//     // Quitar de favoritos
//     favoritos.splice(index, 1);
//     if (favIcon) {
//       favIcon.classList.remove("fas");
//       favIcon.classList.add("far");
//     }
//     mostrarMensaje("Producto eliminado de favoritos");
//   }
  
//   localStorage.setItem("favoritos", JSON.stringify(favoritos));
//   actualizarContadorFavoritos();
//   cargarFavoritosEnModal();
// }

// function actualizarContadorFavoritos() {
//   const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
//   const badge = document.querySelector("#favoritesIcon .badge");
//   if (badge) {
//     badge.textContent = favoritos.length;
//   }
// }

// function mostrarMensaje(texto) {
//   const mensajeExistente = document.querySelector(".mensaje-confirmacion");
//   if (mensajeExistente) {
//     mensajeExistente.remove();
//   }
  
//   const mensaje = document.createElement("div");
//   mensaje.className = "mensaje-confirmacion";
//   mensaje.textContent = texto;
//   document.body.appendChild(mensaje);
  
//   setTimeout(() => {
//     mensaje.classList.add("mostrar");
//     setTimeout(() => {
//       mensaje.classList.remove("mostrar");
//       setTimeout(() => {
//         mensaje.remove();
//       }, 300);
//     }, 2000);
//   }, 10);
// }

// // Carga los productos favoritos en el modal de favoritos
// function cargarFavoritosEnModal() {
//   const favoritosContainer = document.getElementById("favorites-items");
//   if (!favoritosContainer) return;
  
//   const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
//   favoritosContainer.innerHTML = "";
  
//   if (favoritos.length === 0) {
//     favoritosContainer.innerHTML = "<p>No tienes productos favoritos.</p>";
//     return;
//   }
  
//   favoritos.forEach((producto, index) => {
//     const itemDiv = document.createElement("div");
//     itemDiv.className = "cart-item";
//     itemDiv.innerHTML = `
//       <div class="item-details">
//         <h4>${producto.nombre}</h4>
//         <p>${producto.precio}</p>
//       </div>
//       <button class="remove-item" data-index="${index}">×</button>
//     `;
//     favoritosContainer.appendChild(itemDiv);
//   });
  
//   // Asignar eventos a los botones para eliminar favoritos
//   document.querySelectorAll("#favorites-items .remove-item").forEach(button => {
//     button.addEventListener("click", function() {
//       eliminarFavorito(parseInt(this.dataset.index));
//     });
//   });
// }

// function eliminarFavorito(index) {
//   let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
//   const productoEliminado = favoritos[index];
//   favoritos.splice(index, 1);
//   localStorage.setItem("favoritos", JSON.stringify(favoritos));
//   mostrarMensaje(`"${productoEliminado.nombre}" eliminado de favoritos`);
//   actualizarContadorFavoritos();
//   cargarFavoritosEnModal();
// }

// function agregarFavoritoAlCarrito(index) {
//   const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
//   const producto = favoritos[index];
  
//   let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//   carrito.push(producto);
//   localStorage.setItem("carrito", JSON.stringify(carrito));
  
//   actualizarContadorCarrito();
//   mostrarMensaje(`"${producto.nombre}" agregado al carrito`);
// }

// /* ============================================================
//    ============================================================
//    Inicialización General (DOMContentLoaded)
//    ============================================================
//    ============================================================ */

// document.addEventListener("DOMContentLoaded", function() {
//   /* --- Slider --- */
//   const slides = document.querySelectorAll(".banner-slide");
//   const dots = document.querySelectorAll(".pagination-dot");
//   const prevSlideButton = document.querySelector(".prev-banner");
//   const nextSlideButton = document.querySelector(".next-banner");
//   let currentIndex = 0;
  
//   function showSlide(index) {
//     slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
//     dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
//     currentIndex = index;
//   }
  
//   if (prevSlideButton) {
//     prevSlideButton.addEventListener("click", function() {
//       let newIndex = (currentIndex - 1 + slides.length) % slides.length;
//       showSlide(newIndex);
//     });
//   }
  
//   if (nextSlideButton) {
//     nextSlideButton.addEventListener("click", function() {
//       let newIndex = (currentIndex + 1) % slides.length;
//       showSlide(newIndex);
//     });
//   }
  
//   dots.forEach((dot, i) => {
//     dot.addEventListener("click", () => showSlide(i));
//   });
  
//   setInterval(() => {
//     let newIndex = (currentIndex + 1) % slides.length;
//     showSlide(newIndex);
//   }, 5000);
  
//   /* --- Carrusel de Marcas --- */
//   const brandsContainer = document.querySelector('.brands-container');
//   const prevBrandButton = document.querySelector('.prev-brand');
//   const nextBrandButton = document.querySelector('.next-brand');
//   const brandWidth = 170;
  
//   if (prevBrandButton && brandsContainer) {
//     prevBrandButton.addEventListener('click', () => {
//       brandsContainer.scrollLeft -= brandWidth * 2;
//     });
//   }
  
//   if (nextBrandButton && brandsContainer) {
//     nextBrandButton.addEventListener('click', () => {
//       brandsContainer.scrollLeft += brandWidth * 2;
//     });
//   }
  
//   /* --- Cargar Header y Footer --- */
//   fetch('header.html')
//     .then(response => response.text())
//     .then(data => {
//       document.getElementById('header-container').innerHTML = data;
//       attachLoginListener();
//       attachFavoritesListener();
//     })
//     .catch(err => console.error("Error al cargar el header:", err));
  
//   fetch('footer.html')
//     .then(response => response.text())
//     .then(data => {
//       document.getElementById('footer-container').innerHTML = data;
//     })
//     .catch(err => console.error("Error al cargar el footer:", err));
  
//   /* --- Filtros y Carrito --- */
//   initCarrito();
//   const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');
//   if (aplicarFiltrosBtn) {
//     aplicarFiltrosBtn.addEventListener('click', filtrarProductos);
//   }
  
//   /* --- Carrito Modal --- */
//   setTimeout(() => {
//     const cartIcon = document.querySelector(".cart-icon");
//     const cartModal = document.getElementById("cart-modal");
//     const closeCartBtn = document.querySelector("#cart-modal .close-btn");
//     const clearCartBtn = document.getElementById("clear-cart");
    
//     if (cartIcon && cartModal) {
//       cartIcon.addEventListener("click", function() {
//         cartModal.classList.add("active");
//         actualizarCarritoModal();
//       });
//     }
    
//     if (closeCartBtn) {
//       closeCartBtn.addEventListener("click", function() {
//         cartModal.classList.remove("active");
//       });
//     }
    
//     window.addEventListener("click", function(e) {
//       // Cerrar el modal si se hace clic fuera de su contenido
//       if (cartModal && !cartModal.contains(e.target) && e.target !== cartIcon) {
//         cartModal.classList.remove("active");
//       }
//     });
    
//     if (clearCartBtn) {
//       clearCartBtn.addEventListener("click", function() {
//         localStorage.removeItem("carrito");
//         actualizarCarritoModal();
//         actualizarContadorCarrito();
//       });
//     }
    
//     // Eventos de botones "Agregar al carrito" en productos destacados
//     const addToCartButtons = document.querySelectorAll(".release-button");
//     addToCartButtons.forEach(button => {
//       button.addEventListener("click", function() {
//         const card = this.closest(".release-card");
//         const title = card.querySelector(".release-title").textContent;
//         const price = card.querySelector(".release-price").textContent;
//         const imagen = card.querySelector(".release-image img")?.src || "";
//         agregarAlCarrito(title, price, imagen);
//       });
//     });
    
//     actualizarContadorCarrito();
//   }, 500);
  
//   /* --- Favoritos Modal --- */
//   setTimeout(() => {
//     const favModal = document.getElementById("favorites-modal");
//     const closeFavBtn = favModal ? favModal.querySelector(".close-btn") : null;
//     const clearFavBtn = document.getElementById("clear-favorites");
    
//     if (closeFavBtn) {
//       closeFavBtn.addEventListener("click", function() {
//         favModal.classList.remove("active");
//         // AGREGAR ESTA LÍNEA:
//         favModal.style.right = "-350px";
//       });
//     }
    
//     window.addEventListener("click", function(e) {
//       if (favModal && !favModal.contains(e.target) && e.target !== document.getElementById("favoritesIcon")) {
//         favModal.classList.remove("active");
//         // AGREGAR ESTA LÍNEA:
//         favModal.style.right = "-350px";
//       }
//     });
    
//     if (clearFavBtn) {
//       clearFavBtn.addEventListener("click", function() {
//         localStorage.removeItem("favoritos");
//         cargarFavoritosEnModal();
//         actualizarContadorFavoritos();
//       });
//     }
//   }, 500);
  
//   // Inicializa los botones de favoritos en las tarjetas y actualiza el contador
//   activarBotonesFavoritos();
//   actualizarContadorFavoritos();
// });





