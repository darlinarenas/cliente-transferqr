/* =========================================================
   TransferQR - escanear.js
   Página pública del cliente.

   Corrección importante:
   El banco necesita recibir primero el NOMBRE.
   Por eso el copiado ahora va SIN etiquetas y en este orden fijo:

   1) Nombre y apellido
   2) RUT / Cédula
   3) Correo
   4) Banco
   5) Tipo de cuenta
   6) Número de cuenta
   7) Monto, si el cliente lo escribió
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
        console.error('LOAD_PUBLIC_BUSINESS_ERROR', error);
        setText('businessName', 'Negocio no encontrado');
    }
}

function normalizeBusiness(business) {
    return {
        ownerName: cleanValue(
            business.ownerName ||
            business.fullName ||
            business.owner_full_name ||
            business.userFullName ||
            ''
        ),
        taxId: cleanValue(business.taxId || business.rut || business.documentId || ''),
        paymentEmail: cleanValue(business.paymentEmail || business.ownerEmail || business.email || ''),
        bank: cleanValue(business.bank || ''),
        accountType: cleanValue(business.accountType || ''),
        accountNumber: cleanValue(business.accountNumber || ''),
        name: cleanValue(business.name || ''),
        logo: business.logo || ''
    };
}

function renderBusiness(business) {
    setText('businessName', business.name || 'TransferQR');

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
    const amount = amountInput ? cleanValue(amountInput.value) : '';

    // IMPORTANTE:
    // No usamos etiquetas tipo "Banco:" porque algunos bancos pegan
    // el portapapeles por posición. Si agregamos etiquetas, se corren
    // los campos. Aquí el primer dato SIEMPRE es el nombre.
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
        .map(cleanValue)
        .join('\n');

    navigator.clipboard.writeText(transferData)
        .then(showCopyMessage)
        .catch(() => fallbackCopy(transferData));
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showCopyMessage();
    } catch (error) {
        alert('No fue posible copiar los datos.');
    }

    document.body.removeChild(textarea);
}

function cleanValue(value) {
    return String(value || '')
        .replace(/\r?\n|\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
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
