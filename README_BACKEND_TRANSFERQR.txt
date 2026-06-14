# TransferQR

Arquitectura de producción:

- Frontend: Vercel
- Backend: Render
- Base de datos: Supabase PostgreSQL

Los datos de usuario, negocio, QR y escaneos se guardan en Supabase.
El navegador solo mantiene el token de sesión temporal para poder consumir la API.
