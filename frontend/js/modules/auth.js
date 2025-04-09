import { mostrarMensaje } from './ui.js';
import { updateUIBasedOnAuth } from './ui.js';
import { sincronizarCarrito, sincronizarFavoritos } from './syncManager.js';

console.log("Iniciando login...")

export function attachLoginListener() {
  const loginIcon = document.getElementById("loginIcon");
  const loginModal = document.getElementById("loginModal");
  const sessionModal = document.getElementById("session-modal");

  if (!loginIcon || !loginModal || !sessionModal) {
    console.warn("No se encontró el loginIcon o los modales");
    return;
  }

  // auth.js - Actualizar estas líneas
  // En auth.js, modificar el event listener del loginIcon:
  loginIcon.addEventListener("click", function () {
    const token = localStorage.getItem('token');
    const sessionModal = document.getElementById("session-modal"); // Asegurar referencia

    if (token && sessionModal) {
      sessionModal.classList.add("active");
      console.log("Mostrando modal de sesión");
      return; // Salir de la función después de mostrar el modal de sesión
    }

    if (!token) {
      loginModal.style.display = "flex";
    }
  });


  // Cierra el modal con el botón de cierre
  const closeButton = loginModal.querySelector(".close-button");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      loginModal.style.display = "none";
      console.log("Login modal cerrado con la X");
    });
  } else {
    console.warn("No se encontró el botón de cierre (.close-button) en login modal");
  }

  // Cierra el modal al hacer clic fuera del contenido
  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      loginModal.style.display = "none";
      console.log("Login modal cerrado al hacer clic fuera del contenido");
    }
  });

  // Configuración de cambio entre formularios de login y registro
  const signUpButton = loginModal.querySelector("#signUpButton");
  const signInButton = loginModal.querySelector("#signInButton");
  const signInContainer = loginModal.querySelector("#signIn");
  const signUpContainer = loginModal.querySelector("#signup");

  if (signUpButton && signInContainer && signUpContainer) {
    signUpButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Cambiando a Registro (Sign Up)");
      signInContainer.style.display = "none";
      signUpContainer.style.display = "block";
    });
  }
  if (signInButton && signInContainer && signUpContainer) {
    signInButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Cambiando a Acceder (Sign In)");
      signUpContainer.style.display = "none";
      signInContainer.style.display = "block";
    });
  }

  // *** NUEVO: Añadir submit event al formulario de login ***
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Evita que se recargue la página
      const email = document.getElementById("signInEmail").value;
      const password = document.getElementById("signInPassword").value;
      console.log("Formulario de login enviado con:", email, password);
      // Llama a la función login que se encarga de hacer el fetch al backend
      login(email, password);
    });
  } else {
    console.warn("No se encontró el formulario de login con id 'loginForm'");
  }
}

// Actualiza la URL del endpoint de registro
export function attachRegistroListener() {
  const url = 'http://localhost:3000/auth/register';
  const formUsuarios = document.getElementById('registerForm');
  const nombre = document.getElementById('nombre');
  const telefono = document.getElementById('telefono');
  const email = document.getElementById('email');
  const contraseña = document.getElementById('contraseña');
  const direccion = document.getElementById('direccion');

  formUsuarios.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      nombre: nombre.value,
      telefono: telefono.value,
      email: email.value,
      contraseña: contraseña.value,
      direccion: direccion.value
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(data => {
        // Reemplazar el alert con mostrarMensaje
        mostrarMensaje('Registro exitoso. Ahora puedes iniciar sesión', 3000);

        // Cambiar al formulario de login automáticamente
        const signInContainer = document.getElementById("signIn");
        const signUpContainer = document.getElementById("signup");
        if (signInContainer && signUpContainer) {
          signUpContainer.style.display = "none";
          signInContainer.style.display = "block";
        }
      })
      .catch(error => {
        console.log('Error', error);
        mostrarMensaje('Error al registrar. Intenta nuevamente', 3000);
      });
  });
}

function parseJwt(token) {
  try {
    console.log("Token completo:", token);

    // Dividir el token en sus partes
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token inválido');
      return {};
    }

    // Decodificar la parte del payload (segunda parte)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    console.log("Payload decodificado detallado:", payload);

    return payload;
  } catch (e) {
    console.error('Error decodificando JWT', e);
    return {};
  }
}

export async function login(email, password) {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contraseña: password })
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);
    if (response.ok) {
      // Guarda el token en localStorage
      localStorage.setItem('token', data.token);

      // Decodifica el token para extraer el role
      const payload = parseJwt(data.token);
      console.log("Email en payload:", payload.sub);

      // Extrae el rol, con valor por defecto 'cliente'
      const role = payload.role || 'cliente';
      console.log("Rol extraído:", role);

      // Guarda el rol y el ID del usuario en localStorage
      localStorage.setItem('userRole', role);
      localStorage.setItem('userId', payload.id);

      // Sincronizar carrito y favoritos
      await sincronizarCarrito(payload.id);
      await sincronizarFavoritos(payload.id);

      mostrarMensaje('Inicio de sesión exitoso');

      // Cerrar el modal de login
      const loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.style.display = 'none';
      }

      // Si el usuario es admin, redirige a la página de dashboard; de lo contrario, actualiza la UI
      if (role === 'admin') {
        window.location.href = './templates/panel_admin/index.html';
      } else {
        updateUIBasedOnAuth();
      }
    } else {
      mostrarMensaje('Error: ' + data.error);
    }
  } catch (error) {
    console.error(error);
    mostrarMensaje('Error de conexión');
  }
}


export function attachLogoutListener() {
  const logoutIcon = document.getElementById("logoutButton");
  if (logoutIcon) {
    logoutIcon.addEventListener("click", () => {
      logout();
      mostrarMensaje('Sesión cerrada');
    });
    console.log("Listener de logout adjuntado");
  } else {
    console.warn("No se encontró el botón de logout");
  }
}

export function logout() {
  // Mostrar mensaje de confirmación
  mostrarMensaje('Sesión cerrada correctamente');

  // Cerrar el modal de sesión si está abierto
  const sessionModal = document.getElementById('session-modal');
  if (sessionModal && sessionModal.classList.contains('active')) {
    sessionModal.classList.remove('active');
  }

  // Limpiar el almacenamiento local
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');

  // Actualizar la UI
  updateUIBasedOnAuth();

  // Redirigir a la página principal
  window.location.href = `${window.location.origin}/frontend/index.html`;
}