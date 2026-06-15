/* =========================================================
   TransferQR - negocio.js
   Datos del negocio conectados al backend MVP
   SIN datos demo automáticos
========================================================= */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async function () {
    if (!requireTokenOrRedirect()) return;

    try {
        currentUser = await apiGetMe();
        loadUserHeader(currentUser);
        loadBusinessForm(currentUser);
        updatePreview(currentUser);
    } catch (error) {
        alert(error.message);
        clearSession();
        window.location.href = '../pages/login.html';
    }
});

function loadUserHeader(user) {
    const businessName = user.business?.name || user.businessName || 'Mi Negocio';
    setText('businessNameHeader', businessName);
    setText('userEmailHeader', user.email || '');
    setText('userAvatar', getInitial(businessName));
}

function loadBusinessForm(user) {
    const business = user.business || {};
    setValue('businessName', business.name || '');
    setValue('ownerName', business.ownerName || user.fullName || '');
    setValue('taxId', business.taxId || '');
    setValue('paymentEmail', business.paymentEmail || user.email || '');
    setValue('bank', business.bank || '');
    setValue('accountType', business.accountType || '');
    setValue('accountNumber', business.accountNumber || '');
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
}

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

const businessForm = document.getElementById('businessForm');

if (businessForm) {
    businessForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const currentLogo = currentUser?.business?.logo || '';

        const updatedBusiness = {
            name: getValue('businessName'),
            ownerName: getValue('ownerName'),
            taxId: getValue('taxId'),
            paymentEmail: getValue('paymentEmail'),
            bank: getValue('bank'),
            accountType: getValue('accountType'),
            accountNumber: getValue('accountNumber'),
            logo: currentLogo
        };

        try {
            currentUser = await apiUpdateBusiness(updatedBusiness);
            loadUserHeader(currentUser);
            loadBusinessForm(currentUser);
            updatePreview(currentUser);
            showSuccessMessage();
        } catch (error) {
            alert(error.message);
        }
    });
}

const businessLogo = document.getElementById('businessLogo');

if (businessLogo) {
    businessLogo.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async function (readerEvent) {
            const business = {
                name: getValue('businessName'),
                ownerName: getValue('ownerName'),
                taxId: getValue('taxId'),
                paymentEmail: getValue('paymentEmail'),
                bank: getValue('bank'),
                accountType: getValue('accountType'),
                accountNumber: getValue('accountNumber'),
                logo: readerEvent.target.result
            };

            try {
                currentUser = await apiUpdateBusiness(business);
                updatePreview(currentUser);
                showSuccessMessage();
            } catch (error) {
                alert(error.message);
            }
        };
        reader.readAsDataURL(file);
    });
}

function updatePreview(user) {
    const business = user.business || {};
    const previewLogo = document.getElementById('previewLogo');

    if (previewLogo) {
        previewLogo.innerHTML = business.logo
            ? `<img src="${business.logo}" alt="Logo del negocio">`
            : '🏪';
    }

    setText('previewBusinessName', business.name || 'Mi Negocio');
    setText('previewOwnerName', business.ownerName || user.fullName || '---');
    setText('previewBank', business.bank || '---');
    setText('previewAccountType', business.accountType || '---');
    setText('previewAccountNumber', business.accountNumber || '---');
    setText('previewTaxId', business.taxId || '---');
    setText('previewPaymentEmail', business.paymentEmail || '---');
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    if (!successMessage) return;
    successMessage.classList.add('show');
    setTimeout(() => successMessage.classList.remove('show'), 2500);
}

function getInitial(text) {
    if (!text) return 'T';
    return text.trim().charAt(0).toUpperCase();
}
