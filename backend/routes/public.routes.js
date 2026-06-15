/* =========================================================
   TransferQR - Public routes
   100% PostgreSQL/Supabase.

   IMPORTANTE:
   La vista pública necesita devolver también el nombre real
   del dueño/usuario para que el banco reciba primero:
   Nombre, RUT, correo, banco, tipo de cuenta, número de cuenta.
========================================================= */

const express = require('express');
const {
    publicUser,
    findUserByPublicId,
    registerScan
} = require('../utils/database');

const router = express.Router();

router.get('/business/:publicId', async (req, res) => {
    try {
        const user = await findUserByPublicId(req.params.publicId);

        if (!user) {
            return res.status(404).json({ ok: false, message: 'Negocio no encontrado.' });
        }

        await registerScan(req.params.publicId);

        const formatted = publicUser(user);
        const business = formatted.business || {};

        res.json({
            ok: true,
            business: {
                ...business,
                ownerName: formatted.fullName || '',
                fullName: formatted.fullName || '',
                ownerEmail: formatted.email || '',
                email: business.paymentEmail || formatted.email || ''
            }
        });
    } catch (error) {
        console.error('PUBLIC_BUSINESS_ERROR', error);
        res.status(500).json({ ok: false, message: 'Error obteniendo negocio.' });
    }
});

module.exports = router;
