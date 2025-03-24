import { attachLoginListener, attachRegistroListener } from './modules/auth.js';
import { initCarrito, actualizarContadorCarrito } from './modules/cart.js';
import { activarBotonesFavoritos } from './modules/favorites.js';
import { loadHeaderFooter, initSlider, initBrandsCarousel, setupModals, mostrarMensaje } from './modules/ui.js';
import { filtrarProductos } from './modules/filters.js';

document.addEventListener("DOMContentLoaded", function() {
  // Cargar header y footer primero
  loadHeaderFooter()
    .then(() => {
      console.log("Header y footer cargados");
      
      // Luego cargar modales
      if (!document.getElementById('modals-container')) {
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
      
      // Inicializar solo después de cargar todo
      setupModals(); // Esta función ya configurará el login
      attachRegistroListener(); // Añadir este llamado para activar el listener del registro
      initCarrito();
      actualizarContadorCarrito();
      activarBotonesFavoritos();
    })
    .catch(error => {
      console.error("Error de inicialización:", error);
      mostrarMensaje("Error al cargar la página. Por favor, recarga.", 5000);
    });
  
  // Inicializar componentes independientes
  initSlider();
  initBrandsCarousel();
});