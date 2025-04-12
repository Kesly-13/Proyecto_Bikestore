/* ===================== ADMINISTRACIÓN ===================== */
/* Funcionalidades para la sección de administración:
   - Gestión de usuarios (listar, crear, editar, eliminar)
   - Gestión de productos (listar, crear, editar)
   - Manejo de autenticación, navegación y notificaciones
*/
document.addEventListener('DOMContentLoaded', function () {
    // Configuración de modo de prueba
    
    // Elementos del DOM para navegación
    const menuBtns = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.section');

    // Elementos para usuarios
    const usuariosTable = document.getElementById('usuarios-tbody');
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    
    const modalUsuario = document.getElementById('modal-usuario'); // Cambiado de modalCliente a modalUsuario
    const formUsuario = document.getElementById('formulario-usuario'); // Cambiado de formCliente a formUsuario
    const cerrarModalUsuario = modalUsuario ? modalUsuario.querySelector('.cerrar-modal') : null; // Validación añadida
    const tituloModalUsuario = document.getElementById('titulo-modal-usuario'); // Cambiado de tituloModalCliente a tituloModalUsuario
    const cancelarUsuario = document.getElementById('cancelar-usuario'); // Cambiado de cancelarCliente a cancelarUsuario

    // Elementos para productos
    const btnNuevoProducto = document.getElementById('btn-nuevo-producto');
    const modalProducto = document.getElementById('modal-producto');
    const formProducto = document.getElementById('formulario-producto');
    const cerrarModalProducto = modalProducto ? modalProducto.querySelector('.cerrar-modal') : null; // Validación añadida
    const tituloModalProducto = document.getElementById('titulo-modal-producto'); // Corregido de tituloCModalProducto a tituloModalProducto
    const cancelarProducto = document.getElementById('cancelar-producto');

    // Modal de detalles de producto
    const modalDetalleProducto = document.getElementById('modal-detalle-producto');
    const detalleProductoContenido = document.getElementById('detalle-producto-contenido');

    // Elementos de notificación
    const notificacion = document.getElementById('notificacion');

    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');



    const modoPrueba = false;
    const API_BASE = 'http://localhost:3000';
    
    
    // Función para mostrar notificaciones (asegúrate de que está definida)
    function mostrarNotificacion(mensaje, tipo) {
        if (!notificacion) return;
        
        notificacion.textContent = mensaje;
        notificacion.className = `notificacion ${tipo}`;
        notificacion.style.display = 'block';

        setTimeout(() => {
            notificacion.style.display = 'none';
        }, 3000);
    }


    // Array para almacenar los productos obtenidos
    let productos = []; // Definición del array productos

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

    // Verificar si el botón existe antes de añadir el evento
    if (btnNuevoProducto) {
        btnNuevoProducto.addEventListener('click', function() {
            tituloModalProducto.textContent = 'Registrar Nuevo Producto';
            document.getElementById('producto-id').value = '';
            formProducto.reset();
            modalProducto.style.display = 'flex';
        });
    }

    // Navegación entre secciones
    menuBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Desactivar todos los botones y secciones
            menuBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Activar el botón y sección seleccionados
            this.classList.add('active');
            const seccionId = this.dataset.section;
            const seccion = document.getElementById(seccionId);
            
            // Verificar que la sección existe
            if (seccion) {
                seccion.classList.add('active');
            }

            // Si se selecciona la sección de usuarios, actualizarlos
            if (seccionId === 'usuarios') {
                renderizarUsuarios();
            } else if (seccionId === 'productos') {
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
            if (usuariosTable) {
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
            }
            
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
        if (!usuariosTable) return;
        
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
                    
                    // Verificar que los elementos existan antes de asignar valores
                    const usuarioId = document.getElementById('usuario-id');
                    const usuarioNombre = document.getElementById('usuario-nombre');
                    const usuarioCorreo = document.getElementById('usuario-correo');
                    const usuarioTelefono = document.getElementById('usuario-telefono');
                    const usuarioDireccion = document.getElementById('usuario-direccion');
                    
                    // Llenar formulario usando los IDs correctos
                    if (usuarioId) usuarioId.value = usuario.id;
                    if (usuarioNombre) usuarioNombre.value = usuario.nombre;
                    if (usuarioCorreo) usuarioCorreo.value = usuario.email;
                    if (usuarioTelefono) usuarioTelefono.value = usuario.telefono || '';
                    if (usuarioDireccion) usuarioDireccion.value = usuario.direccion || '';
                    
                    // Mostrar modal
                    if (tituloModalUsuario) tituloModalUsuario.textContent = 'Editar Usuario';
                    if (modalUsuario) modalUsuario.style.display = 'flex';
                    
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
                        
                        const usuarioId = document.getElementById('usuario-id');
                        const usuarioNombre = document.getElementById('usuario-nombre');
                        const usuarioCorreo = document.getElementById('usuario-correo');
                        const usuarioTelefono = document.getElementById('usuario-telefono');
                        const usuarioDireccion = document.getElementById('usuario-direccion');
                        
                        if (usuarioId) usuarioId.value = usuarioEjemplo.id;
                        if (usuarioNombre) usuarioNombre.value = usuarioEjemplo.nombre;
                        if (usuarioCorreo) usuarioCorreo.value = usuarioEjemplo.email;
                        if (usuarioTelefono) usuarioTelefono.value = usuarioEjemplo.telefono;
                        if (usuarioDireccion) usuarioDireccion.value = usuarioEjemplo.direccion;
                        
                        if (tituloModalUsuario) tituloModalUsuario.textContent = 'Editar Usuario';
                        if (modalUsuario) modalUsuario.style.display = 'flex';
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

    // Manejo de formulario de usuario: actualización y creación con validación y notificaciones
    if (formUsuario) {
        formUsuario.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Usar los IDs correctos para obtener los valores del formulario
            const usuarioId = document.getElementById('usuario-id');
            const usuarioNombre = document.getElementById('usuario-nombre');
            const usuarioCorreo = document.getElementById('usuario-correo');
            const usuarioTelefono = document.getElementById('usuario-telefono');
            const usuarioDireccion = document.getElementById('usuario-direccion');
            
            const id = usuarioId ? usuarioId.value : '';
            const nombre = usuarioNombre ? usuarioNombre.value : '';
            const email = usuarioCorreo ? usuarioCorreo.value : '';
            const telefono = usuarioTelefono ? usuarioTelefono.value : '';
            const direccion = usuarioDireccion ? usuarioDireccion.value : '';
            
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
                contraseña: 'Temporal123', // Asegurar contraseña
                role: 'cliente'
            };
            
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
                if (modalUsuario) modalUsuario.style.display = 'none';
                formUsuario.reset();
                
                // Actualizar lista de usuarios
                renderizarUsuarios();
                
            } catch (error) {
                console.error('Error:', error);
                mostrarNotificacion(`Error: ${error.message}`, 'error');
            }
        });
    }

    // Botón para abrir modal de nuevo usuario
    if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', function() {
            if (tituloModalUsuario) tituloModalUsuario.textContent = 'Registrar Nuevo Usuario';
            
            const usuarioId = document.getElementById('usuario-id');
            if (usuarioId) usuarioId.value = '';
            
            if (formUsuario) formUsuario.reset();
            if (modalUsuario) modalUsuario.style.display = 'flex';
        });
    }

    // Botón para cancelar formulario usuario
    if (cancelarUsuario) {
        cancelarUsuario.addEventListener('click', function() {
            if (modalUsuario) modalUsuario.style.display = 'none';
            if (formUsuario) formUsuario.reset();
        });
    }

    // Botón para cerrar sesión
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function() {
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
                // Eliminar el token del localStorage
                localStorage.removeItem('token');
                // Redirigir al login
                window.location.href = '/frontend/index.html';
            }
        });
    }

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
        const categorias = ['bicicletas', 'accesorios', 'repuestos', 'ropa_deportiva'];
        
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
    
    // Configuración de acciones para productos
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
    
                if (detalleProductoContenido && modalDetalleProducto) {
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
                }
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
    
                // Verificar si los elementos existen antes de asignar valores
                const productoId = document.getElementById('producto-id');
                const productoNombre = document.getElementById('producto-nombre');
                const productoCategoria = document.getElementById('producto-categoria');
                const productoMarca = document.getElementById('producto-marca');
                const productoPrecio = document.getElementById('producto-precio');
                const productoStock = document.getElementById('producto-stock');
                const productoDisponibilidad = document.getElementById('producto-disponibilidad');
                const productoDescripcion = document.getElementById('producto-descripcion');
                const productoCaracteristicas = document.getElementById('producto-caracteristicas');
    
                // Llenar formulario
                if (productoId) productoId.value = producto.id;
                if (productoNombre) productoNombre.value = producto.nombre;
                if (productoCategoria) productoCategoria.value = producto.categoria;
                if (productoMarca) productoMarca.value = producto.marca || '';
                if (productoPrecio) productoPrecio.value = producto.precio;
                if (productoStock) productoStock.value = producto.stock || 0;
                if (productoDisponibilidad) productoDisponibilidad.value = producto.disponibilidad;
                if (productoDescripcion) productoDescripcion.value = producto.descripcion;
                if (productoCaracteristicas) productoCaracteristicas.value = producto.caracteristicas;
    
                // Cambiar título del modal
                if (tituloModalProducto) tituloModalProducto.textContent = 'Editar Producto';
    
                // Mostrar modal
                if (modalProducto) modalProducto.style.display = 'flex';
            });
        });
    }

    // Cerrar modales con X
    document.querySelectorAll('.cerrar-modal').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function () {
                const modal = this.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        }
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });



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

    if (cancelarProducto) {
        cancelarProducto.addEventListener('click', function() {
            if (modalProducto) modalProducto.style.display = 'none';
            if (formProducto) formProducto.reset();
        });
    }
    
    // Asegurarte de que el evento submit del formulario de productos esté bien configurado
    if (formProducto) {
        formProducto.addEventListener('submit', async (e) => {
            e.preventDefault(); // Esto previene que el formulario se envíe de manera predeterminada
            
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
                if (elemento && !elemento.value) {
                    const label = elemento.previousElementSibling;
                    faltantes.push(label ? label.textContent : id);
                }
            });
        
            if (faltantes.length > 0) {
                mostrarNotificacion(`Faltan campos: ${faltantes.join(', ')}`, 'error');
                return;
            }
        
            // Configurar FormData correctamente
            const formData = new FormData(formProducto);
            
            // Si hay un id, asegurar que se incluya para updates
            const productoId = document.getElementById('producto-id');
            if (productoId && productoId.value) {
                formData.append('id', productoId.value);
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
                const url = (productoId && productoId.value) ? 
                    `${API_BASE}/api/productos/${productoId.value}` : 
                    `${API_BASE}/api/productos`;
                    
                const method = (productoId && productoId.value) ? 'PUT' : 'POST';
                
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
        
                mostrarNotificacion(`Producto ${(productoId && productoId.value) ? 'actualizado' : 'creado'} exitosamente`, 'success');
                
                // Actualiza la lista de productos consultando el backend:
                await renderizarProductos();
                
                // Cerrar el modal y resetear el formulario
                if (modalProducto) modalProducto.style.display = 'none';
                formProducto.reset();
        
            } catch (error) {
                mostrarNotificacion(error.message, 'error');
                console.error('Error:', error);
            }
        });
    }






    // /* ===================== VENTAS ===================== */

 // Función para actualizar el resumen de ventas
 async function actualizarResumenVentas(fechaInicio, fechaFin) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api//ventas/historial?fechaInicio=${fechaInicio || ''}&fechaFin=${fechaFin || ''}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        const ventas = await response.json();
        
        // Cálculos de totales
        const totalVentas = ventas.length;
        const totalIngresos = ventas.reduce((sum, venta) => sum + parseFloat(venta.monto_total), 0);
        const totalProductos = ventas.reduce((sum, venta) => 
            sum + venta.productos.reduce((prodSum, producto) => prodSum + producto.cantidad, 0), 0);

        // Actualizar DOM
        const elementTotalVentas = document.getElementById('total-ventas');
        const elementTotalIngresos = document.getElementById('total-ingresos');
        const elementTotalProductos = document.getElementById('total-productos');
        
        if (elementTotalVentas) elementTotalVentas.textContent = totalVentas;
        if (elementTotalIngresos) elementTotalIngresos.textContent = `$${totalIngresos.toLocaleString()}`;
        if (elementTotalProductos) elementTotalProductos.textContent = totalProductos;
        
        // Actualizar tabla
        const tbody = document.getElementById('ventas-tbody');
        if (tbody) {
            tbody.innerHTML = ventas.map(venta => `
                <tr>
                    <td>${venta.id}</td>
                    <td>${new Date(venta.fecha_pedido).toLocaleDateString()}</td>
                    <td>${venta.direccion_envio}</td>
                    <td>
                        <ul>${venta.productos.map(p => 
                            `<li>${p.producto_nombre} (${p.cantidad}x $${p.precio_unitario})</li>`
                        ).join('')}</ul>
                    </td>
                    <td>$${venta.monto_total}</td>
                    <td>
                        <button class="btn-ver-detalle" data-id="${venta.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                </tr>
            `).join('');
             // Agregar este bloque nuevo
             document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    mostrarNotificacion('🔧 La función de detalle de ventas está en desarrollo', 'info');
                });
            });
        
        
        }
        
    } catch (error) {
        console.error('Error actualizando resumen:', error);
        mostrarNotificacion('Error al cargar datos de ventas: ' + error.message, 'error');
    }
}

// Función para productos más vendidos
async function cargarProductosMasVendidos(periodo) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/ventas/productos-mas-vendidos?periodo=${periodo || 'mes'}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Error en la respuesta del servidor');
        const productos = await response.json();
        
        const contenedor = document.querySelector('.productos-top-categorias');
        if (contenedor) {
            contenedor.innerHTML = productos.map((producto, index) => `
                <div class="categoria-container">
                    <h3>${index + 1}. ${producto.producto_nombre}</h3>
                    <table class="tabla-productos">
                        <tr>
                            <th>Unidades Vendidas</th>
                            <th>Precio Unitario</th>
                            <th>Ingreso Total</th>
                        </tr>
                        <tr>
                            <td>${producto.total_vendido}</td>
                            <td>$${producto.precio}</td>
                            <td>$${(producto.total_vendido * producto.precio).toLocaleString()}</td>
                        </tr>
                    </table>
                </div>
            `).join('');
        }
        
    } catch (error) {
        console.error('Error cargando productos vendidos:', error);
        mostrarNotificacion('Error al cargar productos: ' + error.message, 'error');
    }
}

// Event listeners para los filtros
const btnFiltrarVentas = document.getElementById('btn-filtrar-ventas');
if (btnFiltrarVentas) {
    btnFiltrarVentas.addEventListener('click', () => {
        const fechaInicio = document.getElementById('fecha-inicio').value;
        const fechaFin = document.getElementById('fecha-fin').value;
        actualizarResumenVentas(fechaInicio, fechaFin);
    });
}

const btnFiltrarProductos = document.getElementById('btn-filtrar-productos');
if (btnFiltrarProductos) {
    btnFiltrarProductos.addEventListener('click', () => {
        const periodo = document.getElementById('periodo-vendidos').value;
        cargarProductosMasVendidos(periodo);
    });
}

// Agregar este código al final de tu archivo script_admi.js, dentro del event listener 'DOMContentLoaded'

// ====== CORRECCIÓN PARA LA SECCIÓN DE VENTAS Y PRODUCTOS MÁS VENDIDOS ======

// 1. Corregir ID de sección - asegurar que usamos el nombre correcto del ID
const ventasSection = document.getElementById('ventas-section');

// 2. Configurar eventos para las pestañas de ventas
const ventasTabs = document.querySelectorAll('.ventas-tab');
const ventasContent = document.querySelectorAll('.ventas-content');

// Función para cambiar entre pestañas
function cambiarPestanaVentas() {
    // Desactivar todas las pestañas y contenidos
    ventasTabs.forEach(tab => tab.classList.remove('active'));
    ventasContent.forEach(content => content.classList.remove('active'));
    
    // Activar la pestaña seleccionada
    this.classList.add('active');
    
    // Mostrar el contenido correspondiente
    const tabId = this.getAttribute('data-tab');
    const contenidoActivo = document.getElementById(tabId);
    if (contenidoActivo) {
        contenidoActivo.classList.add('active');
        
        // Cargar datos específicos según la pestaña
        if (tabId === 'productos-vendidos') {
            const periodoSeleccionado = document.getElementById('periodo-vendidos').value;
            cargarProductosMasVendidos(periodoSeleccionado);
        } else if (tabId === 'historial-ventas') {
            actualizarResumenVentas();
        }
    }
}

// Asignar eventos a las pestañas
ventasTabs.forEach(tab => {
    tab.addEventListener('click', cambiarPestanaVentas);
});

// 3. Corregir la inicialización de la sección de ventas
menuBtns.forEach(btn => {
    if (btn.dataset.section === 'ventas-section') {
        btn.addEventListener('click', function() {
            console.log('Inicializando sección de ventas');
            // Inicializar con la primera pestaña activa
            const primeraPestana = document.querySelector('.ventas-tab');
            if (primeraPestana) {
                primeraPestana.click(); // Simular click en la primera pestaña
            }
        });
    }
});

// 4. Mejorar la función de carga de productos más vendidos con mejor manejo de errores
function cargarProductosMasVendidos(periodo) {
    try {
        console.log('Cargando productos más vendidos con periodo:', periodo);
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No hay token de autenticación disponible');
            mostrarNotificacion('Error de autenticación. Por favor inicie sesión nuevamente.', 'error');
            return;
        }
        
        // Mostrar indicador de carga
        const contenedor = document.querySelector('.productos-top-categorias');
        if (contenedor) {
            contenedor.innerHTML = '<div class="cargando">Cargando productos más vendidos...</div>';
        }
        
        const url = `${API_BASE}/api/ventas/productos-mas-vendidos${periodo ? `?periodo=${periodo}` : ''}`;
        console.log('URL de consulta productos vendidos:', url);
        
        fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Error en servidor: ${text}`);
                });
            }
            return response.json();
        })
        .then(productos => {
            console.log('Productos más vendidos recibidos:', productos);
            
            if (contenedor) {
                if (!productos || productos.length === 0) {
                    contenedor.innerHTML = '<div class="alerta-info">No hay datos de ventas para mostrar en este periodo.</div>';
                    return;
                }
                
                contenedor.innerHTML = productos.map((producto, index) => `
                    <div class="categoria-container">
                        <h3>${index + 1}. ${producto.producto_nombre || 'Producto sin nombre'}</h3>
                        <table class="tabla-productos">
                            <tr>
                                <th>Unidades Vendidas</th>
                                <th>Precio Unitario</th>
                                <th>Ingreso Total</th>
                            </tr>
                            <tr>
                                <td>${producto.total_vendido || 0}</td>
                                <td>$${producto.precio ? parseFloat(producto.precio).toLocaleString() : 0}</td>
                                <td>$${((producto.total_vendido || 0) * (producto.precio || 0)).toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>
                `).join('');
            }
        })
        .catch(error => {
            console.error('Error cargando productos vendidos:', error);
            mostrarNotificacion('Error al cargar productos: ' + error.message, 'error');
            
            if (contenedor) {
                contenedor.innerHTML = '<div class="error-mensaje">Error al cargar datos. Intente nuevamente más tarde.</div>';
            }
            
            // En modo de prueba, mostrar datos de ejemplo
            if (modoPrueba) {
                mostrarProductosVendidosEjemplo(contenedor);
            }
        });
        
    } catch (error) {
        console.error('Error general:', error);
        mostrarNotificacion('Error en la aplicación: ' + error.message, 'error');
    }
}

// Función para mostrar datos de ejemplo en modo prueba
function mostrarProductosVendidosEjemplo(contenedor) {
    if (!contenedor) return;
    
    const productosEjemplo = [
        { producto_nombre: "Bicicleta MTB Specialized", total_vendido: 12, precio: 2500000 },
        { producto_nombre: "Casco Fox Racing", total_vendido: 28, precio: 180000 },
        { producto_nombre: "Set de luces LED", total_vendido: 45, precio: 75000 },
        { producto_nombre: "Jersey de ciclismo", total_vendido: 30, precio: 120000 },
        { producto_nombre: "Rueda Shimano 29", total_vendido: 15, precio: 350000 }
    ];
    
    contenedor.innerHTML = productosEjemplo.map((producto, index) => `
        <div class="categoria-container">
            <h3>${index + 1}. ${producto.producto_nombre}</h3>
            <table class="tabla-productos">
                <tr>
                    <th>Unidades Vendidas</th>
                    <th>Precio Unitario</th>
                    <th>Ingreso Total</th>
                </tr>
                <tr>
                    <td>${producto.total_vendido}</td>
                    <td>$${producto.precio.toLocaleString()}</td>
                    <td>$${(producto.total_vendido * producto.precio).toLocaleString()}</td>
                </tr>
            </table>
        </div>
    `).join('');
}


// Inicializar la aplicación de administración
renderizarUsuarios();
renderizarProductos();
});



















