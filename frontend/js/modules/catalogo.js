document.addEventListener("DOMContentLoaded", () => {
    const applyBtn = document.getElementById("filtrar-prod");
    const clearBtn = document.getElementById("clear-filters");
    const productsContainer = document.querySelector(".products-grid");
  
    // Cargar productos iniciales sin filtro
    loadProducts();
  
    // Función para cargar productos desde la API
    // Función para cargar productos desde la API
async function loadProducts(endpoint = "http://localhost:3000/api/productos") {
  try {
    const response = await fetch(endpoint);
    const productos = await response.json();
    renderProducts(productos);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    productsContainer.innerHTML =
      '<p>Error al cargar los productos. Intente nuevamente.</p>';
  }
}

  
    // Función para renderizar productos
    function renderProducts(productos) {
      if (!productos || productos.length === 0) {
        productsContainer.innerHTML = '<p>No se encontraron productos.</p>';
        return;
      }
  
      productsContainer.innerHTML = productos
        .map(
          (producto) => `
        <div class="product-card">
            <div class="favorite-container">
              <i class="favorite-icon far fa-heart"></i>
            </div>
            <a href="vista_catalogo.html?id=${producto.id}">
                <div class="product-image">
                  <img src="${producto.imagen ? `http://localhost:3000/uploads/productos/${producto.imagen}` : '/frontend/img/placeholder-product.jpg'}" alt="${producto.nombre}">
                </div>
                <div class="product-info">
                    <div class="pro-marc">${producto.marca || 'Sin marca'}</div>
                    <div class="product-title">${producto.nombre}</div>
                    <div class="product-price">COP ${producto.precio.toLocaleString()}</div>
                    <div class="product-actions">
                        <button class="add-to-cart" data-id="${producto.id}">
                            <i class="fas fa-shopping-cart"></i> Agregar al carrito
                        </button>
                    </div>
                </div>
            </a>
        </div>
        `
        )
        .join("");
    }
  
    // Aplicar filtros
    applyBtn.addEventListener("click", async () => {
      const selected = getSelectedFilters();
      const queryString = new URLSearchParams();
  
      if (selected.categories.length)
        queryString.append("categorias", selected.categories.join(","));
      if (selected.brands.length)
        queryString.append("marcas", selected.brands.join(","));
      if (selected.prices.length)
        queryString.append("precios", selected.prices.join(","));
  
      try {
        await loadProducts(`/api/productos/filtrar?${queryString}`);
      } catch (error) {
        console.error("Error al filtrar:", error);
        alert("Error al aplicar filtros");
      }
    });
  
    // Limpiar filtros
    clearBtn.addEventListener("click", () => {
      document
        .querySelectorAll(".filters input[type='checkbox']")
        .forEach((cb) => (cb.checked = false));
      loadProducts();
    });
  
    // Obtener filtros seleccionados
    function getSelectedFilters() {
      const filters = {
        categories: [],
        brands: [],
        prices: [],
      };
  
      document.querySelectorAll(".filter-group").forEach((group) => {
        const groupTitle = group.querySelector("h3").textContent;
        group.querySelectorAll("input:checked").forEach((checkbox) => {
          const value = checkbox.parentNode.textContent.trim();
          if (groupTitle.includes("Categorías"))
            filters.categories.push(value);
          if (groupTitle.includes("Marca")) filters.brands.push(value);
          if (groupTitle.includes("Precio")) filters.prices.push(value);
        });
      });
  
      return filters;
    }
  });
  