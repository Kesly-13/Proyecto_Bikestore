import { mostrarMensaje } from './ui.js';

export function attachLoginListener() {
  const loginIcon = document.getElementById("loginIcon");
  const loginModal = document.getElementById("loginModal");
  if (!loginIcon || !loginModal) {
    console.warn("No se encontró el loginIcon o loginModal");
    return;
  }

  loginIcon.addEventListener("click", function () {
    console.log("Se hizo clic en loginIcon");
    loginModal.style.display = "flex";
    console.log("Login modal mostrado");
  });

  const closeButton = loginModal.querySelector(".close-button");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      loginModal.style.display = "none";
      console.log("Login modal cerrado con la X");
    });
  } else {
    console.warn("No se encontró el botón de cierre (.close-button) en login modal");
  }

  loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      loginModal.style.display = "none";
      console.log("Login modal cerrado al hacer clic fuera del contenido");
    }
  });

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
}





// auth.js o registro.js
export function attachRegistroListener() {
  const url = 'http://localhost:3000/api/clientes';
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

    const method = 'POST';
    const endPoint = url;

    fetch(endPoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => response.json())
      .then(data => {
        alert('Cliente registrado exitosamente');
      })
      .catch(error => {
        console.log('Error', error);
        alert('Error al procesar la solicitud');
      });
  });
}






// auth.js
export async function login(email, password) {
  try {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contraseña: password })
    });

    const data = await response.json();
    if (response.ok) {
      // Guarda el token en localStorage
      localStorage.setItem('token', data.token);
      
      // Opcional: decodifica el token para obtener el rol y otros datos
      const payload = parseJwt(data.token);
      localStorage.setItem('userRole', payload.role);
      
      alert('Inicio de sesión exitoso');
      
      // Llama a la función para actualizar la UI según el estado de autenticación
      updateUIBasedOnAuth();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    console.error(error);
    alert('Error de conexión');
  }
}

// Función simple para decodificar el payload del JWT (sin validación)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
