-- =========================================================
-- TransferQR - Supabase/PostgreSQL Schema
-- Ejecutar en Supabase > SQL Editor > New query > Run
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    country TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'FREE',
    qr_generated BOOLEAN NOT NULL DEFAULT FALSE,
    scans INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    owner_name TEXT NOT NULL DEFAULT '',
    logo TEXT NOT NULL DEFAULT '',
    bank TEXT NOT NULL DEFAULT '',
    account_type TEXT NOT NULL DEFAULT '',
    account_number TEXT NOT NULL DEFAULT '',
    tax_id TEXT NOT NULL DEFAULT '',
    payment_email TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT NOT NULL,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id);
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_public_id ON qr_scans(public_id);


-- Campo requerido para que el banco reciba el NOMBRE/TITULAR primero.
-- Este ALTER permite actualizar bases existentes sin borrar datos.
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS owner_name TEXT NOT NULL DEFAULT '';

-- Para negocios ya creados, usar el nombre del usuario como titular inicial.
UPDATE businesses b
SET owner_name = u.full_name
FROM users u
WHERE b.user_id = u.id
  AND (b.owner_name IS NULL OR b.owner_name = '');
