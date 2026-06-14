/* =========================================================
   TransferQR - Auth routes
   100% PostgreSQL/Supabase. 
========================================================= */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const authRequired = require('../middleware/auth.middleware');
const {
    publicUser,
    findUserByEmail,
    findUserById,
    createUserWithBusiness
} = require('../utils/database');

const router = express.Router();

function createToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'transferqr_dev_secret',
        { expiresIn: '7d' }
    );
}

function makePublicId() {
    return crypto.randomUUID().split('-')[0];
}

router.post('/register', async (req, res) => {
    try {
        const { fullName, email, businessName, country, password } = req.body;

        if (!fullName || !email || !businessName || !country || !password) {
            return res.status(400).json({ ok: false, message: 'Faltan datos obligatorios.' });
        }

        if (String(password).length < 6) {
            return res.status(400).json({ ok: false, message: 'La contraseña debe tener mínimo 6 caracteres.' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const exists = await findUserByEmail(normalizedEmail);

        if (exists) {
            return res.status(409).json({ ok: false, message: 'Ya existe una cuenta con ese correo.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await createUserWithBusiness({
            publicId: makePublicId(),
            fullName: String(fullName).trim(),
            email: normalizedEmail,
            businessName: String(businessName).trim(),
            country: String(country).trim(),
            passwordHash
        });

        res.status(201).json({
            ok: true,
            message: 'Cuenta creada correctamente.',
            token: createToken(user),
            user: publicUser(user)
        });
    } catch (error) {
        console.error('REGISTER_ERROR', error);
        res.status(500).json({ ok: false, message: 'Error creando la cuenta.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ ok: false, message: 'Correo y contraseña son obligatorios.' });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const user = await findUserByEmail(normalizedEmail);

        if (!user) {
            return res.status(401).json({ ok: false, message: 'Correo o contraseña incorrectos.' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ ok: false, message: 'Correo o contraseña incorrectos.' });
        }

        res.json({
            ok: true,
            message: 'Sesión iniciada correctamente.',
            token: createToken(user),
            user: publicUser(user)
        });
    } catch (error) {
        console.error('LOGIN_ERROR', error);
        res.status(500).json({ ok: false, message: 'Error iniciando sesión.' });
    }
});

router.get('/me', authRequired, async (req, res) => {
    try {
        const user = await findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado.' });
        }

        res.json({ ok: true, user: publicUser(user) });
    } catch (error) {
        console.error('ME_ERROR', error);
        res.status(500).json({ ok: false, message: 'Error obteniendo usuario.' });
    }
});

module.exports = router;
