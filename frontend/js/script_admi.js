document.addEventListener('DOMContentLoaded', function () {
    // Configuración de modo de prueba
    const modoPrueba = false; // Cambiado a false para usar datos reales

    // API Base URL
    const API_BASE = 'http://localhost:3000';

    // Elementos del DOM para navegación
    const menuBtns = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.section');

    // Elementos para usuarios
    const usuariosTable = document.getElementById('usuarios-tbody');
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    
    const modalCliente = document.getElementById('modal-cliente');
    const formCliente = document.getElementById('formulario-cliente');
    const cerrarModalCliente = modalCliente.querySelector('.cerrar-modal');
    const tituloModalCliente = document.getElementById('titulo-modal-cliente');
    const cancelarCliente = document.getElementById('cancelar-cliente');

    // Elementos para productos
    const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    const modalProducto = document.getElementById('modal-producto');
    const formProducto = document.getElementById('formulario-producto');
    const cerrarModalProducto = modalProducto.querySelector('.cerrar-modal');
    const tituloCModalProducto = document.getElementById('titulo-modal-producto');

    // Modal de detalles de producto
    const modalDetalleProducto = document.getElementById('modal-detalle-producto');
    const detalleProductoContenido = document.getElementById('detalle-producto-contenido');

    // Elementos de notificación
    const notificacion = document.getElementById('notificacion');

    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    // Verificar autenticación
    function verificarAutenticacion() {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirigir al login si no hay token
            window.location.href = '/frontend/login.html';
        }
    }

    // Verificar al cargar
    verificarAutenticacion();

    btnNuevoProducto.addEventListener('click', function() {
        tituloCModalProducto.textContent = 'Registrar Nuevo Producto';
        document.getElementById('producto-id').value = '';
        formProducto.reset();
        modalProducto.style.display = 'flex';
    });

    // Navegación entre secciones
    menuBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Desactivar todos los botones y secciones
            menuBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Activar el botón y sección seleccionados
            this.classList.add('active');
            document.getElementById(this.dataset.section).classList.add('active');

            // Si se selecciona la sección de usuarios, actualizarlos
            if (this.dataset.section === 'usuarios') {
                renderizarUsuarios();
            } else if (this.dataset.section === 'productos') {
                renderizarProductos();
            }
        });
    });

    // Funciones de gestión de usuarios
    async function renderizarUsuarios() {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_BASE}/admin/usuarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error: ${response.status}`);
            }
            
            const usuarios = await response.json();
            
            // Limpiar tabla
            usuariosTable.innerHTML = '';
            
            usuarios.forEach(usuario => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${usuario.nombre}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.telefono || '-'}</td>
                    <td>${usuario.direccion || '-'}</td>
                    <td>
                        <button class="btn-editar-usuario" data-id="${usuario.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-eliminar-usuario" data-id="${usuario.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                usuariosTable.appendChild(row);
            });
            
            // Configurar botones de acciones
            configurarAccionesUsuarios();
            
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            mostrarNotificacion(`Error al cargar usuarios: ${error.message}`, 'error');
            
            if (modoPrueba) {
                // Si estamos en modo prueba, mostrar datos de ejemplo
                mostrarUsuariosEjemplo();
            }
        }
    }

    // Función para mostrar datos de ejemplo en caso de error
    function mostrarUsuariosEjemplo() {
        const usuariosEjemplo = [
            { id: "1", nombre: "Kesly Labio Otero", email: "kesly.labio@gmail.com", telefono: "323 490 7319", direccion: "Carrera 25 #15-50, Medellín" },
            { id: "2", nombre: "Cristina Lopéz", email: "cristina.lopez@gmail.com", telefono: "315 987 6543", direccion: "Calle 10 #20-30, Cartagena" },
            { id: "3", nombre: "Stiven Mendoza", email: "julian.1335@gmail.com", telefono: "311 345 6789", direccion: "Avenida 5 #8-12, Bogotá" }
        ];
        
        usuariosTable.innerHTML = '';
        usuariosEjemplo.forEach(usuario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td>${usuario.telefono}</td>
                <td>${usuario.direccion}</td>
                <td>
                    <button class="btn-editar-usuario" data-id="${usuario.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-eliminar-usuario" data-id="${usuario.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            usuariosTable.appendChild(row);
        });
        
        configurarAccionesUsuarios();
    }

    function configurarAccionesUsuarios() {
        // Botones de editar usuario
        document.querySelectorAll('.btn-editar-usuario').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_BASE}/admin/usuarios/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error('Error al obtener datos de usuario');
                    }
                    
                    const usuario = await response.json();
                    
                    // Llenar formulario
                    document.getElementById('cliente-id').value = usuario.id;
                    document.getElementById('cliente-nombre').value = usuario.nombre;
                    document.getElementById('cliente-correo').value = usuario.email;
                    document.getElementById('cliente-telefono').value = usuario.telefono || '';
                    document.getElementById('cliente-direccion').value = usuario.direccion || '';
                    
                    // Mostrar modal
                    tituloModalCliente.textContent = 'Editar Usuario';
                    modalCliente.style.display = 'flex';
                    
                } catch (error) {
                    console.error('Error:', error);
                    mostrarNotificacion('Error al cargar datos del usuario', 'error');
                    
                    if (modoPrueba) {
                        // En modo prueba, mostrar usuario de ejemplo
                        const usuarioEjemplo = {
                            id: id,
                            nombre: "Usuario Ejemplo",
                            email: "ejemplo@email.com",
                            telefono: "123456789",
                            direccion: "Dirección de ejemplo"
                        };
                        
                        document.getElementById('cliente-id').value = usuarioEjemplo.id;
                        document.getElementById('cliente-nombre').value = usuarioEjemplo.nombre;
                        document.getElementById('cliente-correo').value = usuarioEjemplo.email;
                        document.getElementById('cliente-telefono').value = usuarioEjemplo.telefono;
                        document.getElementById('cliente-direccion').value = usuarioEjemplo.direccion;
                        
                        tituloModalCliente.textContent = 'Editar Usuario';
                        modalCliente.style.display = 'flex';
                    }
                }
            });
        });

        // Botones de eliminar usuario
        document.querySelectorAll('.btn-eliminar-usuario').forEach(btn => {
            btn.addEventListener('click', async function() {
                const id = this.getAttribute('data-id');
                if (confirm('¿Está seguro de eliminar este usuario?')) {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${API_BASE}/admin/usuarios/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        
                        if (!response.ok) {
                            throw new Error('Error al eliminar usuario');
                        }
                        
                        mostrarNotificacion('Usuario eliminado correctamente', 'success');
                        renderizarUsuarios();
                        
                    } catch (error) {
                        console.error('Error:', error);
                        mostrarNotificacion('Error al eliminar usuario', 'error');
                        
                        if (modoPrueba) {
                            // En modo prueba, simular eliminación
                            mostrarNotificacion('Usuario eliminado (simulación)', 'success');
                            this.closest('tr').remove();
                        }
                    }
                }
            });
        });
    }

    // Manejo de formulario de usuario
  // Modificaciones para script_admi.js

// Actualizar el formulario de cliente para manejar contraseñas
formCliente.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('cliente-id').value;
    const nombre = document.getElementById('cliente-nombre').value;
    const email = document.getElementById('cliente-correo').value;
    const telefono = document.getElementById('cliente-telefono').value;
    const direccion = document.getElementById('cliente-direccion').value;
    const contraseña = document.getElementById('cliente-contraseña').value; // Campo nuevo
    
    // Validar campos obligatorios
    if (!nombre || !email) {
        mostrarNotificacion('Nombre y correo electrónico son obligatorios', 'error');
        return;
    }
    
    // Crear objeto de datos
    const userData = {
        nombre,
        email,
        telefono,
        direccion,
        contraseña: contraseña || 'Temporal123', // Asegurar contraseña
        role: 'cliente'
    };
    
    
    // Si es nuevo usuario, incluir contraseña predeterminada
    if (!id) {
        userData.contraseña = 'Temporal123'; // Contraseña temporal para nuevos usuarios
        userData.role = 'cliente'; // Rol por defecto
    }
    
    try {
        const token = localStorage.getItem('token');
        const url = id 
            ? `${API_BASE}/admin/usuarios/${id}` 
            : `${API_BASE}/admin/usuarios`;
        
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la operación');
        }
        
        mostrarNotificacion(
            id ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente', 
            'success'
        );
        
        // Cerrar modal y resetear formulario
        modalCliente.style.display = 'none';
        formCliente.reset();
        
        // Actualizar lista de usuarios
        renderizarUsuarios();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion(`Error: ${error.message}`, 'error');
    }
});

    // Botón para abrir modal de nuevo usuario
    btnNuevoUsuario.addEventListener('click', function() {
        tituloModalCliente.textContent = 'Registrar Nuevo Usuario';
        document.getElementById('cliente-id').value = '';
        formCliente.reset();
        modalCliente.style.display = 'flex';
    });

    // Botón para cancelar formulario usuario
    cancelarCliente.addEventListener('click', function() {
        modalCliente.style.display = 'none';
        formCliente.reset();
    });








    // Añadir event listener para cerrar sesión
btnCerrarSesion.addEventListener('click', function() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        // Eliminar el token del localStorage
        localStorage.removeItem('token');
        // Redirigir al login
        window.location.href = '/frontend/index.html';
    }
});

    

    // Funciones de gestión de productos
    async function renderizarProductos() {
        try {
            // Obtiene los productos actualizados desde el backend
            const productosBackend = await fetchProductos();
            console.log('Productos recibidos del backend:', productosBackend); // Debug
            productos = productosBackend;
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            // Continuar con los productos de ejemplo si hay error
            console.log('Usando productos de ejemplo debido al error');
        }
    
        // Limpiar contenedores
        const categorias = ['bicicletas', 'ropa_deportiva', 'equipamiento', 'suplementos', 'accesorios'];
        
        categorias.forEach(categoria => {
            const contenedor = document.getElementById(`productos-${categoria}`);
            if (contenedor) {
                contenedor.innerHTML = '';
            } else {
                console.warn(`El contenedor productos-${categoria} no existe en el DOM`);
            }
        });
    
        // Renderizar productos por categoría
        productos.forEach(producto => {
            const productoElemento = document.createElement('div');
            productoElemento.classList.add('producto');
            productoElemento.innerHTML = `
                <div class="producto-imagen">
                    <img src="${API_BASE}/uploads/productos/${producto.imagen}" alt="${producto.nombre}">
                </div>
                <div class="producto-info">
                    <h4>${producto.nombre}</h4>
                    <p class="marca">${producto.marca || 'Sin marca'}</p>
                    <p class="precio">$${producto.precio.toLocaleString()} COP</p>
                    <div class="producto-estado">
                        <span class="disponibilidad ${producto.disponibilidad}">
                            ${producto.disponibilidad === 'disponible' ? 'Disponible' :
                            producto.disponibilidad === 'agotado' ? 'Agotado' : 'Próxima Llegada'}
                        </span>
                        <span class="stock">Stock: ${producto.stock || 0}</span>
                    </div>
                </div>
                <div class="producto-acciones">
                    <button class="btn-ver-producto" data-id="${producto.id}">
                        <i class="fas fa-eye"></i> Ver Detalles
                    </button>
                    <button class="btn-editar-producto" data-id="${producto.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;
    
            // Agregar al contenedor según la categoría
            const contenedor = document.getElementById(`productos-${producto.categoria}`);
            if (contenedor) {
                contenedor.appendChild(productoElemento);
            } else {
                console.warn(`Contenedor para categoría ${producto.categoria} no encontrado`);
            }
        });
    
        configurarAccionesProductos();
    }
    
    // Modificar la función de ver detalles del producto
    function configurarAccionesProductos() {
        // Botones de ver detalles de producto
        document.querySelectorAll('.btn-ver-producto').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const producto = productos.find(p => p.id.toString() === id);
                if (!producto) {
                    mostrarNotificacion('Producto no encontrado', 'error');
                    return;
                }
    
                detalleProductoContenido.innerHTML = `
                <div class="detalle-producto">
                  <div class="detalle-imagen">
                    <img src="${API_BASE}/uploads/productos/${producto.imagen}" alt="${producto.nombre}">
                  </div>
                  <div class="detalle-info">
                    <h2>${producto.nombre}</h2>
                    <p class="marca"><strong>Marca:</strong> ${producto.marca || 'Sin especificar'}</p>
                    <p class="descripcion">${producto.descripcion}</p>
                    <div class="detalle-precio">
                      <span>Precio: $${producto.precio.toLocaleString()} COP</span>
                      <span class="disponibilidad ${producto.disponibilidad}">
                        ${producto.disponibilidad === 'disponible' ? 'Disponible' :
                        producto.disponibilidad === 'agotado' ? 'Agotado' : 'Próxima Llegada'}
                      </span>
                      <span class="stock">Stock: ${producto.stock || 0} unidades</span>
                    </div>
                    <div class="caracteristicas">
                      <h3>Características Técnicas</h3>
                      <pre>${producto.caracteristicas}</pre>
                    </div>
                  </div>
                </div>
              `;
                modalDetalleProducto.style.display = 'flex';
            });
        });
    
        // Botones de editar producto
        document.querySelectorAll('.btn-editar-producto').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const producto = productos.find(p => p.id.toString() === id);
                if (!producto) {
                    mostrarNotificacion('Producto no encontrado', 'error');
                    return;
                }
    
                // Llenar formulario
                document.getElementById('producto-id').value = producto.id;
                document.getElementById('producto-nombre').value = producto.nombre;
                document.getElementById('producto-categoria').value = producto.categoria;
                document.getElementById('producto-marca').value = producto.marca || '';
                document.getElementById('producto-precio').value = producto.precio;
                document.getElementById('producto-stock').value = producto.stock || 0;
                document.getElementById('producto-disponibilidad').value = producto.disponibilidad;
                document.getElementById('producto-descripcion').value = producto.descripcion;
                document.getElementById('producto-caracteristicas').value = producto.caracteristicas;
    
                // Cambiar título del modal
                tituloCModalProducto.textContent = 'Editar Producto';
    
                // Mostrar modal
                modalProducto.style.display = 'flex';
            });
        });
    }

    // Cerrar modales con X
    document.querySelectorAll('.cerrar-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Función para mostrar notificaciones
    function mostrarNotificacion(mensaje, tipo) {
        notificacion.textContent = mensaje;
        notificacion.className = `notificacion ${tipo}`;
        notificacion.style.display = 'block';

        setTimeout(() => {
            notificacion.style.display = 'none';
        }, 3000);
    }

    // Función para obtener productos
    async function fetchProductos() {
        try {
            const token = localStorage.getItem('token');
            
            // Si no hay token, simular un error para usar los productos de ejemplo
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            
            const response = await fetch(`${API_BASE}/api/productos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Error obteniendo productos: ${response.status}`);
                } else {
                    const errorText = await response.text();
                    console.error('Respuesta no JSON:', errorText);
                    throw new Error('Error del servidor: Respuesta no válida');
                }
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            throw error;
        }
    }

    // Modificar el submit del formulario de productos
    formProducto.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        // Validar campos requeridos
        const camposRequeridos = [
            'producto-nombre',
            'producto-categoria',
            'producto-marca',
            'producto-precio',
            'producto-stock',
            'producto-disponibilidad'
        ];
    
        let faltantes = [];
        camposRequeridos.forEach(id => {
            const elemento = document.getElementById(id);
            if (!elemento.value) {
                faltantes.push(elemento.previousElementSibling.textContent);
            }
        });
    
        if (faltantes.length > 0) {
            mostrarNotificacion(`Faltan campos: ${faltantes.join(', ')}`, 'error');
            return;
        }
    
        // Configurar FormData correctamente
        const formData = new FormData(formProducto);
        
        // Si hay un id, aseguramos que se incluya en el FormData para updates
        const productoId = document.getElementById('producto-id').value;
        if (productoId) {
            formData.append('id', productoId);
        }
    
        // Validar que campos numéricos tengan valores apropiados
        const precio = parseFloat(formData.get('precio'));
        const stock = parseInt(formData.get('stock'));
        
        if (isNaN(precio) || precio <= 0) {
            mostrarNotificacion('El precio debe ser un número positivo', 'error');
            return;
        }
        
        if (isNaN(stock) || stock < 0) {
            mostrarNotificacion('El stock debe ser un número mayor o igual a cero', 'error');
            return;
        }
    
        // Enviar al backend
        try {
            const url = productoId ? 
                `${API_BASE}/api/productos/${productoId}` : 
                `${API_BASE}/api/productos`;
                
            const method = productoId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
    
            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error en la operación');
                } else {
                    const errorText = await response.text();
                    console.error('Respuesta no JSON:', errorText);
                    throw new Error('Error del servidor: Respuesta no válida');
                }
            }
    
            mostrarNotificacion(`Producto ${productoId ? 'actualizado' : 'creado'} exitosamente`, 'success');
            // Actualiza la lista de productos consultando el backend:
            await renderizarProductos();
            modalProducto.style.display = 'none';
            formProducto.reset();
    
        } catch (error) {
            mostrarNotificacion(error.message, 'error');
            console.error('Error:', error);
        }
    });

    // Inicializar la aplicación
    renderizarUsuarios();
    renderizarProductos();
});