/* =========================================================
   TransferQR - escanear.js
   Página pública del cliente.

   CORRECCIÓN FINAL:
   - La vista cliente ahora muestra el NOMBRE / TITULAR.
   - El botón Copiar Todo copia primero el nombre.
   - Si el backend no trae ownerName/fullName, usa el nombre visible del negocio
     para evitar que el banco pegue "Tipo de cuenta" en el campo Nombre.

   Orden de copiado para banco:
   1) Nombre / Titular
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
    const businessName = cleanValue(
        business.name ||
        business.businessName ||
        business.business_name ||
        ''
    );

    const ownerName = cleanValue(
        business.ownerName ||
        business.fullName ||
        business.full_name ||
        business.owner_full_name ||
        business.userFullName ||
        business.user_full_name ||
        business.titular ||
        business.holderName ||
        business.holder_name ||
        businessName ||
        ''
    );

    return {
        ownerName,
        taxId: cleanValue(business.taxId || business.tax_id || business.rut || business.documentId || business.document_id || ''),
        paymentEmail: cleanValue(business.paymentEmail || business.payment_email || business.ownerEmail || business.owner_email || business.email || ''),
        bank: cleanValue(business.bank || ''),
        accountType: cleanValue(business.accountType || business.account_type || ''),
        accountNumber: cleanValue(business.accountNumber || business.account_number || ''),
        name: businessName,
        logo: business.logo || ''
    };
}

function renderBusiness(business) {
    setText('businessName', business.name || 'TransferQR');

    // Esta línea llena el dato si ya existe en el HTML.
    setText('ownerName', business.ownerName || business.name || '---');

    setText('taxId', business.taxId || '---');
    setText('paymentEmail', business.paymentEmail || '---');
    setText('bank', business.bank || '---');
    setText('accountType', business.accountType || '---');
    setText('accountNumber', business.accountNumber || '---');

    // Esta función crea visualmente la fila NOMBRE si el HTML viejo no la tiene.
    ensureOwnerNameRow(business.ownerName || business.name || '---');

    loadLogo(business);
}

function ensureOwnerNameRow(ownerName) {
    // Si ya existe el elemento ownerName en el HTML, no duplicamos.
    if (document.getElementById('ownerName')) return;

    const bankElement = document.getElementById('bank');
    if (!bankElement) return;

    const bankRow = bankElement.closest('.data-row, .info-row, .detail-row, .transfer-row, li, div');
    if (!bankRow || !bankRow.parentNode) return;

    const ownerRow = bankRow.cloneNode(true);

    const label = ownerRow.querySelector('span, label, p, div');
    if (label) label.textContent = 'Nombre';

    const valueCandidates = ownerRow.querySelectorAll('strong, b, span, p, div');
    const value = valueCandidates[valueCandidates.length - 1];

    if (value) {
        value.id = 'ownerName';
        value.textContent = ownerName || '---';
    } else {
        ownerRow.innerHTML = `<span>Nombre</span><strong id="ownerName">${escapeHtml(ownerName || '---')}</strong>`;
    }

    bankRow.parentNode.insertBefore(ownerRow, bankRow);
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

    const ownerName = cleanValue(publicBusiness.ownerName || publicBusiness.name || '');

    // Orden real para pegar en el banco:
    // Nombre, RUT, Tipo de cuenta, N° cuenta, Banco, Email, Monto.
    // No eliminamos campos vacíos para no correr las posiciones.
    const lines = [
        ownerName,
        publicBusiness.taxId,
        publicBusiness.accountType,
        publicBusiness.accountNumber,
        publicBusiness.bank,
        publicBusiness.paymentEmail
    ].map(cleanValue);

    if (amount) {
        lines.push(amount);
    }

    const transferData = lines.join('\n');

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

function escapeHtml(value) {
    return cleanValue(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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
