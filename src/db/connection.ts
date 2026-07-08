import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Setup PostgreSQL config from environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_sql_password',
  host: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'HavenStayDB',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: process.env.DB_ENCRYPT === 'true' ? { rejectUnauthorized: false } : false
});

export async function initDb() {
  try {
    // Note: In PostgreSQL, you cannot CREATE DATABASE from inside a connection 
    // to that same database if it doesn't exist. You usually connect to 'postgres'
    // or assume the database is already created (e.g., Supabase provides it).
    // For this free deployment flow, we assume the DB exists (Supabase creates it).
    // We will just verify connection by running a simple query.
    
    await pool.query('SELECT 1');
    console.log(`[DB] Connected to PostgreSQL database successfully.`);

    // 1. Create Admins Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Admins" (
        "Id" SERIAL PRIMARY KEY,
        "FullName" VARCHAR(100) NOT NULL,
        "Email" VARCHAR(255) NOT NULL UNIQUE,
        "PasswordHash" VARCHAR(255) NOT NULL,
        "Role" VARCHAR(50) DEFAULT 'Admin',
        "IsTempPassword" BOOLEAN DEFAULT FALSE,
        "ResetToken" VARCHAR(255) NULL,
        "ResetTokenExpiry" TIMESTAMP NULL,
        "IsActive" BOOLEAN DEFAULT TRUE,
        "CreatedTime" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 1b. Add missing columns dynamically if migrating an old schema
    const columnMigrations = [
      { name: 'FullName', sql: `ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "FullName" VARCHAR(100)` },
      { name: 'Email', sql: `ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "Email" VARCHAR(255)` },
      { name: 'Role', sql: `ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "Role" VARCHAR(50) DEFAULT 'Admin'` },
      { name: 'IsTempPassword', sql: `ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "IsTempPassword" BOOLEAN DEFAULT FALSE` },
      { name: 'ResetToken', sql: `ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "ResetToken" VARCHAR(255)` },
      { name: 'ResetTokenExpiry', sql: `ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "ResetTokenExpiry" TIMESTAMP` }
    ];

    for (const migration of columnMigrations) {
      try {
        await pool.query(migration.sql);
      } catch (migErr) {
        // Ignore column exists errors
      }
    }

    // 2. Create Bookings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Bookings" (
        "Id" VARCHAR(50) PRIMARY KEY,
        "RoomId" VARCHAR(50) NOT NULL,
        "RoomTitle" VARCHAR(100) NOT NULL,
        "GuestName" VARCHAR(100) NOT NULL,
        "GuestEmail" VARCHAR(100) NOT NULL,
        "CheckIn" DATE NOT NULL,
        "CheckOut" DATE NOT NULL,
        "Amount" DECIMAL(10,2) NOT NULL,
        "Status" VARCHAR(20) NOT NULL DEFAULT 'confirmed',
        "BookedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Seed Portal Admin if no PortalAdmin exists
    const portalAdminCheck = await pool.query(`SELECT COUNT(*) as count FROM "Admins" WHERE "Role" = 'PortalAdmin'`);
    
    if (parseInt(portalAdminCheck.rows[0].count, 10) === 0) {
      console.log(`[DB] No Portal Admin found. Seeding default Portal Admin...`);
      const saltRounds = 10;
      const defaultPassword = 'haven2026';
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
      
      const portalEmail = process.env.GMAIL_USER && process.env.GMAIL_USER !== 'your_email@gmail.com' 
        ? process.env.GMAIL_USER 
        : 'admin@havenstay.com';

      await pool.query(
        `INSERT INTO "Admins" ("FullName", "Email", "PasswordHash", "Role", "IsTempPassword") VALUES ($1, $2, $3, $4, $5)`,
        ['Portal Administrator', portalEmail, hashedPassword, 'PortalAdmin', true]
      );
      
      console.log(`[DB] ✅ Portal Admin seeded successfully.`);
      console.log(`[DB]    Email: ${portalEmail}`);
      console.log(`[DB]    Password: ${defaultPassword} (temporary — must be changed on first login)`);
    }

    return pool;

  } catch (err) {
    console.error("[DB] Initialization Failed:", err);
    throw err;
  }
}

export async function getConnection() {
  // pg.Pool manages connections automatically, so we just return the pool
  // to act as the "connection" object for queries.
  return pool;
}
