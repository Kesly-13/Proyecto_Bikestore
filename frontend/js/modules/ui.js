// ui.js - Versión corregida compatible con tus modales existentes

/**
 * Muestra un mensaje temporal de confirmación o notificación
 * @param {string} texto - El mensaje a mostrar
 * @param {number} duracion - Duración en milisegundos (por defecto 2000ms)
 */
export function mostrarMensaje(texto, duracion = 2000) {
  // Eliminar mensaje existente si hay uno
  const mensajeExistente = document.querySelector(".mensaje-confirmacion");
  if (mensajeExistente) {
    mensajeExistente.remove();
  }
  
  // Crear nuevo mensaje
  const mensaje = document.createElement("div");
  mensaje.className = "mensaje-confirmacion";
  mensaje.textContent = texto;
  document.body.appendChild(mensaje);
  
  // Mostrar con animación y luego ocultar
  setTimeout(() => {
    mensaje.classList.add("mostrar");
    setTimeout(() => {
      mensaje.classList.remove("mostrar");
      setTimeout(() => {
        mensaje.remove();
      }, 300); // Tiempo para la animación de salida
    }, duracion);
  }, 10);
}

/**
 * Carga el header y footer desde archivos HTML externos
 * @returns {Promise} Una promesa que se resuelve cuando ambos están cargados
 */
export function loadHeaderFooter() {
  console.log("Cargando header y footer...");
  
  // Carga del header
  const headerPromise = fetch('./templates/header.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al cargar header: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const headerContainer = document.getElementById('header-container');
      if (headerContainer) {
        headerContainer.innerHTML = data;
        console.log("Header cargado correctamente");
      } else {
        console.warn("No se encontró el contenedor del header");
      }
    })
    .catch(err => {
      console.error("Error al cargar el header:", err);
      mostrarMensaje("Error al cargar la página. Por favor, recarga.", 3000);
    });
  
  // Carga del footer
  const footerPromise = fetch('./templates/footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error al cargar footer: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const footerContainer = document.getElementById('footer-container');
      if (footerContainer) {
        footerContainer.innerHTML = data;
        console.log("Footer cargado correctamente");
      } else {
        console.warn("No se encontró el contenedor del footer");
      }
    })
    .catch(err => {
      console.error("Error al cargar el footer:", err);
    });
  
  // Retornar una promesa que se resuelve cuando ambos se han cargado
  return Promise.all([headerPromise, footerPromise]).then(() => {
    console.log("Header y footer completamente cargados");
  });
}

/**
 * Configura todos los modales de la aplicación
 */
export function setupModals() {
  console.log("Configurando modales...");
  
  // Agregar clase modal-sidebar a los modales de carrito y favoritos
  const cartModal = document.getElementById("cart-modal");
  const favoritesModal = document.getElementById("favorites-modal");
  const loginModal = document.getElementById("loginModal");
  
  if (cartModal) {
    cartModal.classList.add("modal-sidebar");
    console.log("Clase modal-sidebar añadida al carrito");
  }
  
  if (favoritesModal) {
    favoritesModal.classList.add("modal-sidebar");
    console.log("Clase modal-sidebar añadida a favoritos");
  }

  if (!cartModal || !favoritesModal || !loginModal) {
    console.warn("No se encontraron todos los modales necesarios");
    // No seguir si faltan elementos
    return;
  }
  
  // Configurar cada modal
  setupLoginModal();
  setupCartModal();
  setupFavoritesModal();
  
  console.log("Configuración de modales completada");
}

/**
 * Configura el modal de login/registro
 */
function setupLoginModal() {
  const loginIcon = document.getElementById("loginIcon");
  const loginModal = document.getElementById("loginModal");
  
  if (!loginIcon || !loginModal) {
    console.warn("No se encontró el ícono o modal de login");
    return;
  }
  
  // Manejador para abrir modal
  loginIcon.addEventListener("click", function() {
    console.log("Se hizo clic en loginIcon");
    loginModal.style.display = "flex";
    console.log("Login modal mostrado");
  });
  
  // Manejador para cerrar modal con X
  const closeButton = loginModal.querySelector(".close-button");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      loginModal.style.display = "none";
      console.log("Login modal cerrado con la X");
    });
  } else {
    console.warn("No se encontró el botón de cierre para el modal de login");
  }
  
  // Cerrar al hacer clic fuera del modal
  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      loginModal.style.display = "none";
      console.log("Login modal cerrado al hacer clic fuera");
    }
  });
  
  // Configurar cambio entre formularios
  const signUpButton = document.getElementById("signUpButton");
  const signInButton = document.getElementById("signInButton");
  const signInContainer = document.getElementById("signIn");
  const signUpContainer = document.getElementById("signup");
  
  if (signUpButton && signInContainer && signUpContainer) {
    signUpButton.addEventListener("click", function(e) {
      e.preventDefault();
      signInContainer.style.display = "none";
      signUpContainer.style.display = "block";
      console.log("Cambiando a formulario de registro");
    });
  }
  
  if (signInButton && signInContainer && signUpContainer) {
    signInButton.addEventListener("click", function(e) {
      e.preventDefault();
      signUpContainer.style.display = "none";
      signInContainer.style.display = "block";
      console.log("Cambiando a formulario de login");
    });
  }
}

/**
 * Configura el modal del carrito
 */
function setupCartModal() {
  const cartIcon = document.querySelector(".cart-icon");
  const cartModal = document.getElementById("cart-modal");
  
  if (!cartIcon || !cartModal) {
    console.warn("No se encontró el ícono o modal del carrito");
    return;
  }
  
  // Asignar manejador de eventos para abrir el modal
  cartIcon.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Se hizo clic en el ícono del carrito");
    cartModal.classList.add("active");
    
    // Cargar dinámicamente el módulo del carrito
    import('./cart.js').then(module => {
      module.actualizarCarritoModal();
      console.log("Carrito actualizado en el modal");
    }).catch(err => {
      console.error("Error al cargar el módulo del carrito:", err);
    });
  });
  
  // Configurar botón de cierre
  const closeCartBtn = cartModal.querySelector(".close-btn");
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", () => {
      cartModal.classList.remove("active");
      console.log("Modal del carrito cerrado");
    });
  } else {
    console.warn("No se encontró el botón de cierre para el modal del carrito");
  }
  
  // Configurar botón para vaciar carrito
  const clearCartBtn = document.getElementById("clear-cart");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      localStorage.setItem("carrito", JSON.stringify([]));
      import('./cart.js').then(module => {
        module.actualizarContadorCarrito();
        module.actualizarCarritoModal();
        mostrarMensaje("Carrito vaciado correctamente");
        console.log("Carrito vaciado");
      }).catch(err => {
        console.error("Error al vaciar el carrito:", err);
      });
    });
  }
  
  // Cerrar al hacer clic fuera del modal
  document.addEventListener("click", function(event) {
    if (cartModal.classList.contains("active") && 
        !cartModal.contains(event.target) && 
        !cartIcon.contains(event.target)) {
      cartModal.classList.remove("active");
      console.log("Modal del carrito cerrado al hacer clic fuera");
    }
  });
}

/**
 * Configura el modal de favoritos
 */
function setupFavoritesModal() {
  const favIcon = document.getElementById("favoritesIcon");
  const favModal = document.getElementById("favorites-modal");
  
  if (!favIcon || !favModal) {
    console.warn("No se encontró el ícono o modal de favoritos");
    return;
  }
  
  // Asignar manejador de eventos para abrir el modal
  favIcon.addEventListener("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Se hizo clic en el ícono de favoritos");
    favModal.classList.add("active");
    
    // Cargar dinámicamente el módulo de favoritos
    import('./favorites.js').then(module => {
      module.cargarFavoritosEnModal();
      console.log("Favoritos cargados en el modal");
    }).catch(err => {
      console.error("Error al cargar el módulo de favoritos:", err);
    });
  });
  
  // Configurar botón de cierre
  const closeFavBtn = favModal.querySelector(".close-btn");
  if (closeFavBtn) {
    closeFavBtn.addEventListener("click", () => {
      favModal.classList.remove("active");
      console.log("Modal de favoritos cerrado");
    });
  } else {
    console.warn("No se encontró el botón de cierre para el modal de favoritos");
  }
  
  // Configurar botón para vaciar favoritos
  const clearFavBtn = document.getElementById("clear-favorites");
  if (clearFavBtn) {
    clearFavBtn.addEventListener("click", e => {
      e.stopPropagation(); // Evitar que se cierre el modal
      localStorage.setItem("favoritos", JSON.stringify([]));
      import('./favorites.js').then(module => {
        module.actualizarContadorFavoritos();
        module.cargarFavoritosEnModal();
        module.actualizarEstadoCorazones(); // Actualizar los corazones en las tarjetas
        mostrarMensaje("Lista de favoritos vaciada");
        console.log("Favoritos vaciados");
      }).catch(err => {
        console.error("Error al vaciar favoritos:", err);
      });
    });
  }
  
  // Prevenir cierre al hacer clic dentro del modal
  favModal.addEventListener("click", function(event) {
    event.stopPropagation();
  });
  
  // Cerrar solo al hacer clic fuera del modal
  document.addEventListener("click", function(event) {
    if (favModal.classList.contains("active") && 
        !favModal.contains(event.target) && 
        !favIcon.contains(event.target)) {
      favModal.classList.remove("active");
      console.log("Modal de favoritos cerrado al hacer clic fuera");
    }
  });
}

/**
 * Inicializa el slider de banners
 */
export function initSlider() {
  const slides = document.querySelectorAll(".banner-slide");
  const dots = document.querySelectorAll(".pagination-dot");
  const prevSlideButton = document.querySelector(".prev-banner");
  const nextSlideButton = document.querySelector(".next-banner");
  const bannerNav = document.querySelector(".banner-nav");

  if (!slides.length) {
    console.warn("No se encontraron slides para el banner");
    return;
  }

  let currentIndex = 0;
  let sliderInterval;

  function showSlide(index) {
    clearInterval(sliderInterval);

    if (index >= slides.length) {
      index = 0;
    } else if (index < 0) {
      index = slides.length - 1;
    }

    // En lugar de modificar el z-index de todas las diapositivas,
    // solo cambiamos la opacidad y aplicamos la clase active
    slides.forEach((slide) => {
      slide.classList.remove("active");
      slide.style.opacity = "0";
    });

    slides[index].classList.add("active");
    slides[index].style.opacity = "1";

    if (dots.length === slides.length) {
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    currentIndex = index;
    console.log("Mostrando slide:", index);

    startSliderInterval();
  }

  function startSliderInterval() {
    sliderInterval = setInterval(() => {
      console.log("Intervalo: mostrando slide", currentIndex + 1);
      showSlide(currentIndex + 1);
    }, 5000);
  }

  if (prevSlideButton) {
    prevSlideButton.addEventListener("click", (e) => {
      e.preventDefault();
      showSlide(currentIndex - 1);
    });
  }

  if (nextSlideButton) {
    nextSlideButton.addEventListener("click", (e) => {
      e.preventDefault();
      showSlide(currentIndex + 1);
    });
  }

  if (dots.length) {
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        showSlide(i);
      });
    });
  }

  // Asegurarnos de que los botones de navegación tengan siempre el z-index más alto
  if (bannerNav) {
    bannerNav.style.zIndex = "10";
  }

  // Iniciar el slider mostrando el primer slide
  showSlide(0);
  console.log("Carrusel de banner inicializado correctamente");
}


/**
 * Inicializa el carrusel de marcas
 */
export function initBrandsCarousel() {
  const brandsContainer = document.querySelector('.brands-container');
  const prevBrandButton = document.querySelector('.prev-brand');
  const nextBrandButton = document.querySelector('.next-brand');
  
  if (!brandsContainer) {
    console.warn("No se encontró el contenedor de marcas");
    return;
  }
  
  const brandWidth = 170; // Ancho de cada elemento marca en píxeles
  
  // Configurar navegación anterior
  if (prevBrandButton) {
    prevBrandButton.addEventListener("click", () => {
      brandsContainer.scrollBy({
        left: -brandWidth * 2,
        behavior: 'smooth'
      });
    });
  }
  
  // Configurar navegación siguiente
  if (nextBrandButton) {
    nextBrandButton.addEventListener("click", () => {
      brandsContainer.scrollBy({
        left: brandWidth * 2,
        behavior: 'smooth'
      });
    });
  }
  
  console.log("Carrusel de marcas inicializado correctamente");
}