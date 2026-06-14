/* =========================================================
   TransferQR - auth.js
   Registro y Login conectados al backend MVP
========================================================= */

const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const businessName = document.getElementById('businessName').value.trim();
        const country = document.getElementById('country').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password.length < 6) {
            alert('La contraseña debe tener mínimo 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            await apiRegister({ fullName, email, businessName, country, password });
            alert('Cuenta creada correctamente.');
            window.location.href = '../pages/dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        try {
            await apiLogin({ email, password });
            window.location.href = '../pages/dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });
}
