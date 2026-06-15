/* =========================================================
   TransferQR - escanear.js
   Página pública que verá el cliente, conectada al backend.
   Orden de visualización y copiado optimizado para bancos.
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
        publicBusiness = normalizeBusiness(data.business || {});
        renderBusiness(publicBusiness);
    } catch (error) {
        setText('businessName', 'Negocio no encontrado');
    }
}

function normalizeBusiness(business) {
    return {
        ownerName: business.ownerName || business.fullName || business.name || '',
        taxId: business.taxId || '',
        paymentEmail: business.paymentEmail || business.ownerEmail || business.email || '',
        bank: business.bank || '',
        accountType: business.accountType || '',
        accountNumber: business.accountNumber || '',
        name: business.name || '',
        logo: business.logo || ''
    };
}

function renderBusiness(business) {
    setText('businessName', business.name || business.ownerName || 'TransferQR');

    // Orden visible solicitado:
    // 1) Nombre y apellido, 2) RUT/Cédula, 3) Email,
    // 4) Banco, 5) Tipo de cuenta, 6) Número de cuenta.
    setText('ownerName', business.ownerName || '---');
    setText('taxId', business.taxId || '---');
    setText('paymentEmail', business.paymentEmail || '---');
    setText('bank', business.bank || '---');
    setText('accountType', business.accountType || '---');
    setText('accountNumber', business.accountNumber || '---');

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

    const amountInput = document.getElementById('amount');
    const amount = amountInput ? amountInput.value.trim() : '';

    // Texto pensado para pegar en el banco o en una nota sin desorden.
    // Va en el orden exacto pedido por el usuario.
    // Dejamos valores limpios, uno por línea, sin textos extras al inicio.
    const lines = [
        publicBusiness.ownerName,
        publicBusiness.taxId,
        publicBusiness.paymentEmail,
        publicBusiness.bank,
        publicBusiness.accountType,
        publicBusiness.accountNumber
    ];

    if (amount) {
        lines.push(amount);
    }

    const transferData = lines
        .map(value => String(value || '').trim())
        .filter(Boolean)
        .join('
');

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
