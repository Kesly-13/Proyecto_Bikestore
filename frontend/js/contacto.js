/**
 * Script principal para la página de contacto de Bike Store
 * Este archivo contiene la lógica de validación y animación del formulario
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const contactContainer = document.querySelector('.contact-container');
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const successMessage = document.getElementById('successMessage');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    // Animar la entrada del contenedor al cargar la página
    setTimeout(() => {
        contactContainer.classList.add('show');
    }, 100);

    /**
     * Función para validar formato de correo electrónico
     * @param {string} email - El correo electrónico a validar
     * @return {boolean} - Verdadero si el correo es válido, falso si no
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Función para mostrar mensaje de error en un campo
     * @param {HTMLElement} input - El elemento de entrada con error
     * @param {HTMLElement} errorElement - El elemento que muestra el mensaje de error
     * @param {string} message - El mensaje de error a mostrar
     */
    function showError(input, errorElement, message) {
        input.style.borderColor = 'var(--error-color)';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    /**
     * Función para ocultar mensaje de error
     * @param {HTMLElement} input - El elemento de entrada
     * @param {HTMLElement} errorElement - El elemento que muestra el mensaje de error
     */
    function hideError(input, errorElement) {
        input.style.borderColor = '#ddd';
        errorElement.style.display = 'none';
    }

    // Validación en tiempo real para el campo de nombre
    nameInput.addEventListener('input', function() {
        if (nameInput.value.trim() !== '') {
            hideError(nameInput, nameError);
        }
    });

    // Validación en tiempo real para el campo de correo electrónico
    emailInput.addEventListener('input', function() {
        if (isValidEmail(emailInput.value)) {
            hideError(emailInput, emailError);
        }
    });

    // Validación en tiempo real para el campo de mensaje
    messageInput.addEventListener('input', function() {
        if (messageInput.value.trim() !== '') {
            hideError(messageInput, messageError);
        }
    });

    // Manejador del evento de envío del formulario
    contactForm.addEventListener('submit', function(e) {
        // Prevenir el comportamiento por defecto del formulario
        e.preventDefault();
        let formValid = true;

        // Validación del nombre
        if (nameInput.value.trim() === '') {
            showError(nameInput, nameError, 'Por favor ingresa tu nombre completo');
            formValid = false;
        } else {
            hideError(nameInput, nameError);
        }

        // Validación del correo electrónico
        if (!isValidEmail(emailInput.value)) {
            showError(emailInput, emailError, 'Por favor ingresa un correo electrónico válido');
            formValid = false;
        } else {
            hideError(emailInput, emailError);
        }

        // Validación del mensaje
        if (messageInput.value.trim() === '') {
            showError(messageInput, messageError, 'Por favor ingresa tu mensaje');
            formValid = false;
        } else {
            hideError(messageInput, messageError);
        }

        // Si todos los campos son válidos, proceder con el envío
        if (formValid) {
            console.log("Formulario válido, mostrando mensaje de éxito");

            successMessage.style.display = 'block';
            contactForm.reset();
            
            // Ocultar el mensaje de éxito después de 3 segundos
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 10000);
        }
        
        
    });
});