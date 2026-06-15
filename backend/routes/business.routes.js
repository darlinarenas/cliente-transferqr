/* =========================================================
   TransferQR - Business routes privadas
   100% PostgreSQL/Supabase.
========================================================= */

const express = require('express');
const QRCode = require('qrcode');

const authRequired = require('../middleware/auth.middleware');
const {
    publicUser,
    findUserById,
    updateBusiness,
    markQrGenerated
} = require('../utils/database');

const router = express.Router();

function getPublicBaseUrl() {
    return process.env.PUBLIC_BASE_URL || 'https://cliente-transferqr-frontend.vercel.app';
}

function buildPublicUrl(publicId) {
    return `${getPublicBaseUrl()}/pages/escanear.html?id=${publicId}`;
}

function businessIsReady(business) {
    return Boolean(
        business &&
        business.name &&
        business.ownerName &&
        business.taxId &&
        business.paymentEmail &&
        business.bank &&
        business.accountType &&
        business.accountNumber
    );
}

router.get('/me', authRequired, async (req, res) => {
    try {
        const user = await findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
        }

        res.json({ ok: true, user: publicUser(user) });
    } catch (error) {
        console.error('BUSINESS_ME_ERROR', error);
        res.status(500).json({ ok: false, message: 'Error obteniendo datos del negocio.' });
    }
});

router.put('/me', authRequired, async (req, res) => {
    try {
        const current = await findUserById(req.user.id);

        if (!current) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
        }

        const incoming = req.body.business || req.body;

        const updatedBusiness = {
            name: String(incoming.name || '').trim(),
            ownerName: String(incoming.ownerName || incoming.owner_name || current.owner_name || current.full_name || '').trim(),
            taxId: String(incoming.taxId || '').trim(),
            paymentEmail: String(incoming.paymentEmail || '').trim().toLowerCase(),
            bank: String(incoming.bank || '').trim(),
            accountType: String(incoming.accountType || '').trim(),
            accountNumber: String(incoming.accountNumber || '').trim(),
            logo: incoming.logo || current.logo || ''
        };

        const user = await updateBusiness(req.user.id, updatedBusiness);

        res.json({ ok: true, message: 'Datos del negocio guardados.', user: publicUser(user) });
    } catch (error) {
        console.error('UPDATE_BUSINESS_ERROR', error);
        res.status(500).json({ ok: false, message: 'Error guardando datos del negocio.' });
    }
});

router.post('/qr', authRequired, async (req, res) => {
    try {
        const current = await findUserById(req.user.id);

        if (!current) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
        }

        const userPublic = publicUser(current);

        if (!businessIsReady(userPublic.business)) {
            return res.status(400).json({ ok: false, message: 'Primero completa los datos del negocio.' });
        }

        const publicUrl = buildPublicUrl(current.public_id);
        const qrDataUrl = await QRCode.toDataURL(publicUrl, {
            width: 420,
            margin: 2
        });

        const updatedUser = await markQrGenerated(req.user.id);

        res.json({
            ok: true,
            publicId: current.public_id,
            publicUrl,
            qrDataUrl,
            user: publicUser(updatedUser)
        });
    } catch (error) {
        console.error('GENERATE_QR_ERROR', error);
        res.status(500).json({ ok: false, message: 'Error generando el QR.' });
    }
});

module.exports = router;
