/* =========================================================
   TransferQR - vista-cliente.js
   Vista cliente interna conectada al backend.
   No guarda datos del negocio en el navegador.
========================================================= */

let currentUser = null;

/* ==========================
   INICIO
========================== */

document.addEventListener('DOMContentLoaded', async function () {
    if (!requireTokenOrRedirect()) return;

    try {
        currentUser = await apiGetMe();
        loadHeader(currentUser);
        loadClientView(currentUser);
    } catch (error) {
        alert(error.message);
        clearSession();
        window.location.href = '../pages/login.html';
    }
});

/* ==========================
   HEADER
========================== */

function loadHeader(user) {
    const businessName = user.business?.name || user.businessName || 'Mi Negocio';

    document.getElementById('businessNameHeader').textContent = businessName;
    document.getElementById('userEmailHeader').textContent = user.email || '';
    document.getElementById('userAvatar').textContent = businessName.charAt(0).toUpperCase();
}

/* ==========================
   CARGAR VISTA CLIENTE
========================== */

function loadClientView(user) {
    const business = user.business || {};

    document.getElementById('clientBusinessName').textContent = business.name || 'Mi Negocio';
    document.getElementById('clientBank').textContent = business.bank || '---';
    document.getElementById('clientAccountType').textContent = business.accountType || '---';
    document.getElementById('clientAccountNumber').textContent = business.accountNumber || '---';
    document.getElementById('clientTaxId').textContent = business.taxId || '---';
    document.getElementById('clientPaymentEmail').textContent = business.paymentEmail || '---';

    const logo = document.getElementById('clientLogo');

    if (logo && business.logo) {
        logo.innerHTML = `<img src="${business.logo}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
    }
}

/* ==========================
   COPIAR DATOS
========================== */

function copyTransferData() {
    if (!currentUser) return;

    const business = currentUser.business || {};
    const amount = document.getElementById('transferAmount').value || '0';

    const text = `Banco: ${business.bank || ''}
Tipo de cuenta: ${business.accountType || ''}
Número de cuenta: ${business.accountNumber || ''}
RUT / ID: ${business.taxId || ''}
Correo: ${business.paymentEmail || ''}
Monto: ${amount}`;

    navigator.clipboard.writeText(text);

    const message = document.getElementById('copyMessage');

    if (message) {
        message.classList.add('show');
        setTimeout(() => message.classList.remove('show'), 2500);
    }
}

/* ==========================
   SIMULAR ESCANEO
========================== */

function simulateClientScan() {
    alert('Esta vista es una simulación. Los escaneos reales se registran cuando alguien abre el QR público.');
}
