// filters.js

export function filtrarProductos() {
  const categoriaSeleccionada = document.getElementById('filtro-categoria').value;
  const precioInput = document.getElementById('filtro-precio').value;
  const precioMaximo = parseFloat(precioInput.replace(/[^0-9]/g, '')); // Elimina caracteres no numéricos
  const productos = document.querySelectorAll('.product-card');
  let productosVisibles = 0;

  productos.forEach(card => {
    const categoria = card.getAttribute('data-categoria');
    const precio = parseFloat(card.getAttribute('data-precio'));
    const cumpleCategoria = (categoriaSeleccionada === 'todos' || categoria === categoriaSeleccionada);
    const cumplePrecio = (isNaN(precioMaximo) || precio <= precioMaximo);

    if (cumpleCategoria && cumplePrecio) {
      card.style.display = 'block';
      productosVisibles++;
    } else {
      card.style.display = 'none';
    }
  });

  // Mostrar mensaje si no hay resultados
  let noResults = document.querySelector('.no-results');
  if (!noResults) {
    noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No se encontraron productos con estos filtros.';
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
      productGrid.appendChild(noResults);
    }
  }
  noResults.style.display = productosVisibles === 0 ? 'block' : 'none';
}