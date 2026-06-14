/* =========================================================
   TransferQR - Auth middleware
========================================================= */

const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.replace('Bearer ', '') : null;

    if (!token) {
        return res.status(401).json({ ok: false, message: 'Token requerido.' });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'transferqr_dev_secret');
        next();
    } catch (error) {
        return res.status(401).json({ ok: false, message: 'Sesión inválida o vencida.' });
    }
}

module.exports = authRequired;
