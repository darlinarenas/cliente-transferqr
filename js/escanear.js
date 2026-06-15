/* =========================================================
   TransferQR - escanear.js
   Página pública del cliente.

   CORRECCIÓN FINAL:
   El copiado para el banco debe iniciar SIEMPRE con el nombre.
   Si el backend no trae ownerName/fullName, se usa el nombre del negocio.
   Nunca se usa accountType como nombre.
========================================================= */

let publicBusiness = null;

document.addEventListener('DOMContentLoaded', function () {
    loadBusinessData();

    const copyButton = document.getElementById('copyTransferData');
    if (copyButton) {
        copyButton.addEventListener('click', copyTransferData);
    }

    const legacyCopyButton = document.querySelector('[onclick="copyTransferData()"]');
    if (legacyCopyButton) {
        legacyCopyButton.removeAttribute('onclick');
        legacyCopyButton.addEventListener('click', copyTransferData);
    }
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
        business.owner ||
        businessName ||
        ''
    );

    return {
        ownerName,
        taxId: cleanValue(
            business.taxId ||
            business.tax_id ||
            business.rut ||
            business.documentId ||
            business.document_id ||
            business.document ||
            ''
        ),
        paymentEmail: cleanValue(
            business.paymentEmail ||
            business.payment_email ||
            business.ownerEmail ||
            business.owner_email ||
            business.email ||
            ''
        ),
        bank: cleanValue(business.bank || business.bankName || business.bank_name || ''),
        accountType: cleanValue(
            business.accountType ||
            business.account_type ||
            business.typeAccount ||
            business.type_account ||
            ''
        ),
        accountNumber: cleanValue(
            business.accountNumber ||
            business.account_number ||
            business.numberAccount ||
            business.number_account ||
            ''
        ),
        name: businessName,
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
    if (!publicBusiness) {
        alert('Los datos todavía no están cargados.');
        return;
    }

    const amountInput = document.getElementById('amount');
    const amount = amountInput ? cleanValue(amountInput.value) : '';

    const nameForBank = cleanValue(publicBusiness.ownerName || publicBusiness.name || '');

    if (!nameForBank) {
        alert('Falta el nombre del titular. Guarda nuevamente los datos del negocio.');
        return;
    }

    /*
      ORDEN EXACTO PARA PEGAR EN EL BANCO:

      1) Nombre y apellido
      2) RUT / Cédula
      3) Correo
      4) Banco
      5) Tipo de cuenta
      6) Número de cuenta
      7) Monto, si existe

      IMPORTANTE:
      Van sin etiquetas, uno debajo del otro.
    */
    const lines = [
        nameForBank,
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
        .filter(value => value !== '')
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
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
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
    if (!message) {
        alert('Datos copiados correctamente.');
        return;
    }

    message.classList.add('show');
    setTimeout(() => message.classList.remove('show'), 2500);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}
