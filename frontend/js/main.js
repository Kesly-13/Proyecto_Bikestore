import { attachLoginListener, attachRegistroListener, attachLogoutListener } from './modules/auth.js';
import { initCarrito, actualizarContadorCarrito } from './modules/cart.js';
import { activarBotonesFavoritos } from './modules/favorites.js';
import { loadHeaderFooter, initSlider, initBrandsCarousel, setupModals, mostrarMensaje, setupSessionModal } from './modules/ui.js';
import { filtrarProductos } from './modules/filters.js';
import { updateUIBasedOnAuth } from './modules/ui.js';

document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const navMenu = document.querySelector('.nav-menu');
    const scrollPos = window.pageYOffset;
    document.querySelectorAll('.motivation-section img, .promotion-section img').forEach(img => {
      img.style.transform = `translateY(${scrollPos * 0.1}px)`;
    });
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
      navMenu.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
      navMenu.classList.remove('scrolled');
    }
  });
  // Primero cargar header y footer
  loadHeaderFooter()
    .then(() => {
      console.log("Header y footer cargados");
      // Luego cargar los modales
      const modalsContainer = document.getElementById('modals-container');
      if (!modalsContainer) {
        console.error("No se encontró el contenedor de modales");
        return Promise.reject("Falta el contenedor de modales");
      }
      return fetch('./templates/modals.html')
        .then(response => {
          if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
          return response.text();
        });
    })

    .then(html => {
      document.getElementById('modals-container').innerHTML = html;
      console.log("Modales cargados");

      // Añadir esta línea
      setupSessionModal(); // <-- Configurar modal de sesión

      setupModals();
      attachLoginListener();
      attachRegistroListener();
      initCarrito();
      actualizarContadorCarrito();
      activarBotonesFavoritos();
      updateUIBasedOnAuth();
      attachLogoutListener();
    })
    .catch(error => {
      console.error("Error de inicialización:", error);
      mostrarMensaje("Error al cargar la página. Por favor, recarga.", 5000);
    });

  // Inicializar componentes independientes
  initSlider();
  initBrandsCarousel();
});
