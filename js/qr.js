/* =========================================================
   TransferQR - qr.js
   QR real generado desde backend Render + Supabase.
========================================================= */

let currentQrData = null;

document.addEventListener('DOMContentLoaded', async function () {
    if (!requireTokenOrRedirect()) return;

    try {
        const user = await apiGetMe();
        loadUserHeader(user);
        loadQrPayload(user);
        await paintInitialQR(user);
    } catch (error) {
        alert(error.message);
        clearSession();
        window.location.href = '../pages/login.html';
    }
});

function getFrontendBaseUrl() {
    return window.location.origin;
}

function buildFallbackPublicUrl(publicId) {
    return `${getFrontendBaseUrl()}/pages/escanear.html?id=${encodeURIComponent(publicId)}`;
}

function loadUserHeader(user) {
    const businessName = user.business?.name || user.businessName || 'Mi Negocio';
    setText('businessNameHeader', businessName);
    setText('userEmailHeader', user.email || '');
    setText('userAvatar', getInitial(businessName));
}

function businessIsReady(user) {
    const business = user.business || {};

    return Boolean(
        business.name &&
        business.taxId &&
        business.paymentEmail &&
        business.bank &&
        business.accountType &&
        business.accountNumber
    );
}

function loadQrPayload(user) {
    const qrPayload = document.getElementById('qrPayload');
    if (!qrPayload) return;

    if (!businessIsReady(user)) {
        qrPayload.textContent = 'Primero debes completar los datos del negocio en la sección Mi Negocio.';
        return;
    }

    const publicUrl = buildFallbackPublicUrl(user.publicId);

    qrPayload.textContent = `URL pública permanente:
${publicUrl}

ID público del negocio:
${user.publicId}`;
}

async function paintInitialQR(user) {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;

    if (!businessIsReady(user)) {
        drawEmptyQR(canvas, 'Completa tus datos', 'para generar el QR');
        return;
    }

    if (user.qrGenerated) {
        await generateQR(false);
    } else {
        drawEmptyQR(canvas, 'Listo para generar', 'presiona el botón');
    }
}

async function generateQR(markAsGenerated = true) {
    const canvas = document.getElementById('qrCanvas');
    const qrPayload = document.getElementById('qrPayload');
    const successMessage = document.getElementById('successMessage');

    if (!canvas) return;

    try {
        currentQrData = await apiGenerateQR();
        drawQrImage(canvas, currentQrData.qrDataUrl);

        if (qrPayload) {
            qrPayload.textContent = `URL pública permanente:
${currentQrData.publicUrl}

ID público del negocio:
${currentQrData.publicId}`;
        }

        if (markAsGenerated && successMessage) {
            successMessage.classList.add('show');
            setTimeout(() => successMessage.classList.remove('show'), 2500);
        }
    } catch (error) {
        alert(error.message);
    }
}

function drawQrImage(canvas, dataUrl) {
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    img.src = dataUrl;
}

function drawEmptyQR(canvas, line1, line2) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#e7e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, size - 40, size - 40);
    ctx.fillStyle = '#73778c';
    ctx.font = '700 15px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(line1, size / 2, size / 2 - 10);
    ctx.fillText(line2, size / 2, size / 2 + 16);
}

function downloadQR() {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'transferqr-mi-negocio.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function getInitial(text) {
    if (!text) return 'T';
    return text.trim().charAt(0).toUpperCase();
}
