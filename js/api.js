/* =========================================================
   TransferQR - api.js
   Frontend conectado a backend Render + Supabase.
   Los datos del usuario, negocio y QR viven en PostgreSQL/Supabase.
========================================================= */

const API_BASE_URL = window.TRANSFERQR_API_URL || 'https://cliente-transferqr.onrender.com';
const TOKEN_KEY = 'transferqr_token';

function saveSession(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
}

async function apiRequest(path, options = {}) {
    const headers = options.headers || {};
    const token = getToken();

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Error de conexión con el servidor.');
    }

    return data;
}

async function apiRegister(payload) {
    const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (data.token) {
        saveSession(data.token);
    }

    return data;
}

async function apiLogin(payload) {
    const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (data.token) {
        saveSession(data.token);
    }

    return data;
}

async function apiGetMe() {
    const data = await apiRequest('/api/auth/me');
    return data.user;
}

async function apiUpdateBusiness(business) {
    const data = await apiRequest('/api/business/me', {
        method: 'PUT',
        body: JSON.stringify({ business })
    });

    return data.user;
}

async function apiGenerateQR() {
    return await apiRequest('/api/business/qr', {
        method: 'POST'
    });
}

async function apiGetPublicBusiness(publicId) {
    return await apiRequest(`/api/public/business/${encodeURIComponent(publicId)}`);
}

function requireTokenOrRedirect() {
    if (!getToken()) {
        window.location.href = '../pages/login.html';
        return false;
    }

    return true;
}

function logout() {
    clearSession();
    window.location.href = '../pages/login.html';
}
