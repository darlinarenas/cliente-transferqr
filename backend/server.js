/* =========================================================
   TransferQR - Backend MVP
   Node.js + Express + PostgreSQL/Supabase
========================================================= */

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const businessRoutes = require('./routes/business.routes');
const publicRoutes = require('./routes/public.routes');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.PUBLIC_BASE_URL,
    'https://cliente-transferqr-frontend.vercel.app'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('No permitido por CORS'));
    }
}));

app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '8mb' }));

/*
   En Render este backend puede servir archivos estáticos si están presentes,
   pero en producción la cara visible oficial es Vercel.
*/
app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        app: 'TransferQR Backend',
        database: 'PostgreSQL/Supabase',
        date: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/public', publicRoutes);

app.use((req, res) => {
    res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`TransferQR backend corriendo en puerto ${PORT}`);
});
