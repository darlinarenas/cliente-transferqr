/* =========================================================
   TransferQR - Public routes
   100% PostgreSQL/Supabase. 
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

        res.json({
            ok: true,
            business: formatted.business
        });
    } catch (error) {
        console.error('PUBLIC_BUSINESS_ERROR', error);
        res.status(500).json({ ok: false, message: 'Error obteniendo negocio.' });
    }
});

module.exports = router;
