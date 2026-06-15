/* =========================================================
   TransferQR - PostgreSQL/Supabase database helper
   100% base de datos. 
========================================================= */

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.warn('ADVERTENCIA: DATABASE_URL no está configurada. Configúrala en Render.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

function businessFromRow(row) {
    if (!row) return null;

    return {
        name: row.business_name_value || '',
        ownerName: row.owner_name || row.full_name || '',
        logo: row.logo || '',
        bank: row.bank || '',
        accountType: row.account_type || '',
        accountNumber: row.account_number || '',
        taxId: row.tax_id || '',
        paymentEmail: row.payment_email || ''
    };
}

function publicUser(row) {
    if (!row) return null;

    return {
        id: row.id,
        publicId: row.public_id,
        fullName: row.full_name,
        email: row.email,
        businessName: row.business_name,
        country: row.country,
        plan: row.plan,
        qrGenerated: Boolean(row.qr_generated),
        scans: Number(row.scans || 0),
        business: businessFromRow(row),
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

async function query(text, params = []) {
    return pool.query(text, params);
}

async function findUserByEmail(email) {
    const result = await query(
        `
        SELECT
            u.*,
            b.name AS business_name_value,
            b.owner_name,
            b.logo,
            b.bank,
            b.account_type,
            b.account_number,
            b.tax_id,
            b.payment_email
        FROM users u
        LEFT JOIN businesses b ON b.user_id = u.id
        WHERE u.email = $1
        LIMIT 1
        `,
        [email]
    );

    return result.rows[0] || null;
}

async function findUserById(id) {
    const result = await query(
        `
        SELECT
            u.*,
            b.name AS business_name_value,
            b.owner_name,
            b.logo,
            b.bank,
            b.account_type,
            b.account_number,
            b.tax_id,
            b.payment_email
        FROM users u
        LEFT JOIN businesses b ON b.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
        `,
        [id]
    );

    return result.rows[0] || null;
}

async function findUserByPublicId(publicId) {
    const result = await query(
        `
        SELECT
            u.*,
            b.name AS business_name_value,
            b.owner_name,
            b.logo,
            b.bank,
            b.account_type,
            b.account_number,
            b.tax_id,
            b.payment_email
        FROM users u
        LEFT JOIN businesses b ON b.user_id = u.id
        WHERE u.public_id = $1
        LIMIT 1
        `,
        [publicId]
    );

    return result.rows[0] || null;
}

async function createUserWithBusiness({ publicId, fullName, email, businessName, country, passwordHash }) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `
            INSERT INTO users (
                public_id,
                full_name,
                email,
                business_name,
                country,
                password_hash,
                plan,
                qr_generated
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'FREE', false)
            RETURNING *
            `,
            [publicId, fullName, email, businessName, country, passwordHash]
        );

        const user = userResult.rows[0];

        await client.query(
            `
            INSERT INTO businesses (
                user_id,
                name,
                owner_name,
                logo,
                bank,
                account_type,
                account_number,
                tax_id,
                payment_email
            )
            VALUES ($1, $2, $3, '', '', '', '', '', $4)
            `,
            [user.id, businessName, fullName, email]
        );

        await client.query('COMMIT');

        return findUserById(user.id);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function updateBusiness(userId, business) {
    const result = await query(
        `
        UPDATE businesses
        SET
            name = $2,
            owner_name = $3,
            tax_id = $4,
            payment_email = $5,
            bank = $6,
            account_type = $7,
            account_number = $8,
            logo = $9,
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
        `,
        [
            userId,
            business.name,
            business.ownerName,
            business.taxId,
            business.paymentEmail,
            business.bank,
            business.accountType,
            business.accountNumber,
            business.logo || ''
        ]
    );

    if (result.rowCount === 0) {
        await query(
            `
            INSERT INTO businesses (
                user_id,
                name,
                owner_name,
                tax_id,
                payment_email,
                bank,
                account_type,
                account_number,
                logo
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `,
            [
                userId,
                business.name,
                business.ownerName,
                business.taxId,
                business.paymentEmail,
                business.bank,
                business.accountType,
                business.accountNumber,
                business.logo || ''
            ]
        );
    }

    await query(
        `
        UPDATE users
        SET business_name = $2, updated_at = NOW()
        WHERE id = $1
        `,
        [userId, business.name]
    );

    return findUserById(userId);
}

async function markQrGenerated(userId) {
    await query(
        `
        UPDATE users
        SET qr_generated = true, updated_at = NOW()
        WHERE id = $1
        `,
        [userId]
    );

    return findUserById(userId);
}

async function registerScan(publicId) {
    await query(
        `
        UPDATE users
        SET scans = scans + 1, updated_at = NOW()
        WHERE public_id = $1
        `,
        [publicId]
    );

    await query(
        `
        INSERT INTO qr_scans (public_id)
        VALUES ($1)
        `,
        [publicId]
    ).catch(() => null);
}

module.exports = {
    query,
    publicUser,
    findUserByEmail,
    findUserById,
    findUserByPublicId,
    createUserWithBusiness,
    updateBusiness,
    markQrGenerated,
    registerScan
};
