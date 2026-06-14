/* =========================================================
   TransferQR - escanear.js
   Página pública que verá el cliente, conectada al backend
========================================================= */

let publicBusiness = null;

document.addEventListener('DOMContentLoaded', function () {
    loadBusinessData();
});

async function loadBusinessData() {
    const params = new URLSearchParams(window.location.search);
    const publicId = params.get('id');

    if (!publicId) {
        setText('businessName', 'QR inválido');
        return;
    }

    try {
        const data = await apiGetPublicBusiness(publicId);
        publicBusiness = data.business || {};
        renderBusiness(publicBusiness);
    } catch (error) {
        setText('businessName', 'Negocio no encontrado');
    }
}

function renderBusiness(business) {
    setText('businessName', business.name || 'Mi Negocio');
    setText('bank', business.bank || '---');
    setText('accountType', business.accountType || '---');
    setText('accountNumber', business.accountNumber || '---');
    setText('taxId', business.taxId || '---');
    setText('paymentEmail', business.paymentEmail || '---');
    loadLogo(business);
}

function loadLogo(business) {
    const logoContainer = document.getElementById('businessLogo');
    if (!logoContainer) return;

    if (business.logo) {
        logoContainer.innerHTML = `<img src="${business.logo}" alt="Logo">`;
    }
}

function copyTransferData() {
    if (!publicBusiness) return;

    const amount = document.getElementById('amount').value || '0';

    const transferData = `Monto: ${amount}

Banco: ${publicBusiness.bank || ''}
Tipo de cuenta: ${publicBusiness.accountType || ''}
Número de cuenta: ${publicBusiness.accountNumber || ''}
RUT / ID: ${publicBusiness.taxId || ''}
Correo: ${publicBusiness.paymentEmail || ''}
Negocio: ${publicBusiness.name || ''}`;

    navigator.clipboard.writeText(transferData)
        .then(showCopyMessage)
        .catch(() => alert('No fue posible copiar los datos.'));
}

function showCopyMessage() {
    const message = document.getElementById('copySuccess');
    if (!message) return;
    message.classList.add('show');
    setTimeout(() => message.classList.remove('show'), 2500);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}
