/* =========================================================
   TransferQR - dashboard.js
   Dashboard conectado al backend MVP
========================================================= */

document.addEventListener('DOMContentLoaded', async function () {
    if (!requireTokenOrRedirect()) return;

    try {
        const user = await apiGetMe();
        loadDashboard(user);
    } catch (error) {
        alert(error.message);
        clearSession();
        window.location.href = '../pages/login.html';
    }
});

function loadDashboard(user) {
    setText('welcomeTitle', 'Bienvenido, ' + (user.fullName || ''));
    setText('businessNameHeader', user.business?.name || user.businessName || 'Mi Negocio');
    setText('userEmailHeader', user.email || '');
    setText('userAvatar', getInitial(user.business?.name || user.businessName || user.fullName));
    setText('qrCount', user.qrGenerated ? '1 / 1' : '0 / 1');
    setText('scanCount', user.scans || 0);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function getInitial(text) {
    if (!text) return 'T';
    return text.trim().charAt(0).toUpperCase();
}
