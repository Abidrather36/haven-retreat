import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getConnection } from '../db/connection';
import { sendTempPasswordEmail, sendPasswordResetEmail, sendPasswordChangedConfirmation } from '../utils/mailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const router = Router();

// ─── Helper: Generate a secure random temporary password ───
function generateTempPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%&*';
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ─── Helper: Password validation ───
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters long.');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter.');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter.');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number.');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Password must contain at least one special character.');
  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════
// POST /api/admin/login
// ═══════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password are required.' });

  try {
    const pool = await getConnection();
    const result = await pool.query(
      `SELECT "Id", "FullName", "Email", "PasswordHash", "Role", "IsTempPassword", "IsActive" FROM "Admins" WHERE "Email" = $1`,
      [email]
    );

    if (result.rows.length === 0) return res.status(401).json({ success: false, error: 'Invalid credentials. Access denied.' });

    const admin = result.rows[0];
    if (!admin.IsActive) return res.status(403).json({ success: false, error: 'Account is deactivated.' });

    const passwordMatch = await bcrypt.compare(password, admin.PasswordHash);
    if (!passwordMatch) return res.status(401).json({ success: false, error: 'Invalid credentials. Access denied.' });

    res.json({ 
      success: true, 
      message: 'Authentication successful.',
      user: {
        id: admin.Id,
        fullName: admin.FullName,
        email: admin.Email,
        role: admin.Role,
        isTempPassword: !!admin.IsTempPassword,
        isActive: !!admin.IsActive
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/admin/create
// ═══════════════════════════════════════════════════════════
router.post('/create', async (req, res) => {
  const { fullName, email, role, requestedBy } = req.body;
  if (!fullName || !email) return res.status(400).json({ success: false, error: 'Full name and email are required.' });
  if (!requestedBy) return res.status(403).json({ success: false, error: 'Unauthorized.' });

  try {
    const pool = await getConnection();

    const requesterCheck = await pool.query(
      `SELECT "Role" FROM "Admins" WHERE "Id" = $1 AND "IsActive" = TRUE`,
      [requestedBy]
    );
    if (requesterCheck.rows.length === 0 || requesterCheck.rows[0].Role !== 'PortalAdmin') {
      return res.status(403).json({ success: false, error: 'Only Portal Administrators can create new admin accounts.' });
    }

    const existingCheck = await pool.query(`SELECT "Id" FROM "Admins" WHERE "Email" = $1`, [email]);
    if (existingCheck.rows.length > 0) return res.status(409).json({ success: false, error: 'Email already exists.' });

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const adminRole = role || 'Admin';

    const insertResult = await pool.query(
      `INSERT INTO "Admins" ("FullName", "Email", "PasswordHash", "Role", "IsTempPassword") 
       VALUES ($1, $2, $3, $4, $5) RETURNING "Id"`,
      [fullName, email, hashedPassword, adminRole, true]
    );

    const newId = insertResult.rows[0].Id;
    
    // Fire and forget email to prevent UI blocking
    sendTempPasswordEmail(email, fullName, tempPassword);

    res.status(201).json({ 
      success: true, 
      message: `Admin created successfully.`,
      user: { id: newId, fullName, email, role: adminRole, isTempPassword: true, isActive: true }
    });
  } catch (err) {
    console.error("Create Admin Error:", err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /api/admin/users
// ═══════════════════════════════════════════════════════════
router.get('/users', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.query(`
      SELECT "Id" as id, "FullName" as "fullName", "Email" as email, "Role" as role, 
             "IsTempPassword" as "isTempPassword", "IsActive" as "isActive", "CreatedTime" as "createdTime" 
      FROM "Admins" ORDER BY "CreatedTime" DESC
    `);
    
    const users = result.rows.map(u => ({
      ...u,
      isTempPassword: !!u.isTempPassword,
      isActive: !!u.isActive
    }));

    res.json({ success: true, data: users });
  } catch (err) {
    console.error("List Admins Error:", err);
    res.status(500).json({ success: false, error: 'Database error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// PUT /api/admin/users/:id
// ═══════════════════════════════════════════════════════════
router.put('/users/:id', async (req, res) => {
  const { fullName, email, role, isActive, requestedBy } = req.body;
  const targetId = parseInt(req.params.id);
  if (!requestedBy) return res.status(403).json({ success: false, error: 'Unauthorized.' });

  try {
    const pool = await getConnection();

    const requesterCheck = await pool.query(`SELECT "Role" FROM "Admins" WHERE "Id" = $1 AND "IsActive" = TRUE`, [requestedBy]);
    if (requesterCheck.rows.length === 0 || requesterCheck.rows[0].Role !== 'PortalAdmin') {
      return res.status(403).json({ success: false, error: 'Only Portal Administrators can modify admin accounts.' });
    }

    if (email) {
      const emailCheck = await pool.query(`SELECT "Id" FROM "Admins" WHERE "Email" = $1 AND "Id" != $2`, [email, targetId]);
      if (emailCheck.rows.length > 0) return res.status(409).json({ success: false, error: 'Another admin uses this email.' });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (fullName !== undefined) { updates.push(`"FullName" = $${paramIndex++}`); values.push(fullName); }
    if (email !== undefined) { updates.push(`"Email" = $${paramIndex++}`); values.push(email); }
    if (role !== undefined) { updates.push(`"Role" = $${paramIndex++}`); values.push(role); }
    if (isActive !== undefined) { updates.push(`"IsActive" = $${paramIndex++}`); values.push(isActive); }

    if (updates.length === 0) return res.status(400).json({ success: false, error: 'No fields to update.' });

    values.push(targetId);
    await pool.query(`UPDATE "Admins" SET ${updates.join(', ')} WHERE "Id" = $${paramIndex}`, values);

    const updated = await pool.query(`
      SELECT "Id" as id, "FullName" as "fullName", "Email" as email, "Role" as role, 
             "IsTempPassword" as "isTempPassword", "IsActive" as "isActive", "CreatedTime" as "createdTime" 
      FROM "Admins" WHERE "Id" = $1
    `, [targetId]);

    if (updated.rows.length === 0) return res.status(404).json({ success: false, error: 'Admin not found.' });

    const user = updated.rows[0];
    res.json({ success: true, message: 'Admin updated.', user: { ...user, isTempPassword: !!user.isTempPassword, isActive: !!user.isActive } });
  } catch (err) {
    console.error("Update Admin Error:", err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// DELETE /api/admin/users/:id
// ═══════════════════════════════════════════════════════════
router.delete('/users/:id', async (req, res) => {
  const targetId = parseInt(req.params.id);
  const requestedBy = parseInt(req.query.requestedBy as string);
  if (!requestedBy) return res.status(403).json({ success: false, error: 'Unauthorized.' });

  try {
    const pool = await getConnection();

    const requesterCheck = await pool.query(`SELECT "Role" FROM "Admins" WHERE "Id" = $1 AND "IsActive" = TRUE`, [requestedBy]);
    if (requesterCheck.rows.length === 0 || requesterCheck.rows[0].Role !== 'PortalAdmin') {
      return res.status(403).json({ success: false, error: 'Only Portal Administrators can delete admin accounts.' });
    }

    if (targetId === requestedBy) return res.status(400).json({ success: false, error: 'Cannot delete yourself.' });

    const targetUser = await pool.query(`SELECT "Role" FROM "Admins" WHERE "Id" = $1`, [targetId]);
    if (targetUser.rows.length === 0) return res.status(404).json({ success: false, error: 'Admin not found.' });

    if (targetUser.rows[0].Role === 'PortalAdmin') {
      const portalAdminCount = await pool.query(`SELECT COUNT(*) as count FROM "Admins" WHERE "Role" = 'PortalAdmin'`);
      if (parseInt(portalAdminCount.rows[0].count, 10) <= 1) return res.status(400).json({ success: false, error: 'Cannot delete last Portal Administrator.' });
    }

    await pool.query(`DELETE FROM "Admins" WHERE "Id" = $1`, [targetId]);
    res.json({ success: true, message: 'Admin deleted successfully.' });
  } catch (err) {
    console.error("Delete Admin Error:", err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/admin/change-password
// ═══════════════════════════════════════════════════════════
router.post('/change-password', async (req, res) => {
  const { adminId, currentPassword, newPassword } = req.body;
  if (!adminId || !currentPassword || !newPassword) return res.status(400).json({ success: false, error: 'Missing parameters.' });

  const validation = validatePassword(newPassword);
  if (!validation.valid) return res.status(400).json({ success: false, error: validation.errors.join(' ') });

  try {
    const pool = await getConnection();

    const adminResult = await pool.query(`SELECT "Id", "FullName", "Email", "PasswordHash" FROM "Admins" WHERE "Id" = $1 AND "IsActive" = TRUE`, [adminId]);
    if (adminResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Admin not found.' });
    
    const admin = adminResult.rows[0];
    const currentMatch = await bcrypt.compare(currentPassword, admin.PasswordHash);
    if (!currentMatch) return res.status(401).json({ success: false, error: 'Current password incorrect.' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE "Admins" SET "PasswordHash" = $1, "IsTempPassword" = FALSE WHERE "Id" = $2`, [newHash, adminId]);

    sendPasswordChangedConfirmation(admin.Email, admin.FullName);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/admin/force-change-password
// ═══════════════════════════════════════════════════════════
router.post('/force-change-password', async (req, res) => {
  const { adminId, newPassword } = req.body;
  if (!adminId || !newPassword) return res.status(400).json({ success: false, error: 'Missing parameters.' });

  const validation = validatePassword(newPassword);
  if (!validation.valid) return res.status(400).json({ success: false, error: validation.errors.join(' ') });

  try {
    const pool = await getConnection();

    const adminResult = await pool.query(`SELECT "Id", "FullName", "Email", "IsTempPassword" FROM "Admins" WHERE "Id" = $1 AND "IsActive" = TRUE`, [adminId]);
    if (adminResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Admin not found.' });
    
    const admin = adminResult.rows[0];
    if (!admin.IsTempPassword) return res.status(400).json({ success: false, error: 'Not a temp password.' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE "Admins" SET "PasswordHash" = $1, "IsTempPassword" = FALSE WHERE "Id" = $2`, [newHash, adminId]);

    sendPasswordChangedConfirmation(admin.Email, admin.FullName);
    res.json({ success: true, message: 'Password set.', user: { id: admin.Id, fullName: admin.FullName, email: admin.Email, isTempPassword: false }});
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/admin/forgot-password
// ═══════════════════════════════════════════════════════════
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email required.' });

  try {
    const pool = await getConnection();

    const adminResult = await pool.query(`SELECT "Id", "FullName", "Email" FROM "Admins" WHERE "Email" = $1 AND "IsActive" = TRUE`, [email]);
    if (adminResult.rows.length === 0) return res.json({ success: true, message: 'Sent if exists.' });

    const admin = adminResult.rows[0];
    const resetToken = crypto.randomUUID();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(`UPDATE "Admins" SET "ResetToken" = $1, "ResetTokenExpiry" = $2 WHERE "Id" = $3`, [resetToken, resetExpiry, admin.Id]);

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    sendPasswordResetEmail(admin.Email, admin.FullName, `${appUrl}/#reset-password?token=${resetToken}`);

    res.json({ success: true, message: 'Sent if exists.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /api/admin/reset-password
// ═══════════════════════════════════════════════════════════
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ success: false, error: 'Missing parameters.' });

  const validation = validatePassword(newPassword);
  if (!validation.valid) return res.status(400).json({ success: false, error: validation.errors.join(' ') });

  try {
    const pool = await getConnection();

    const adminResult = await pool.query(`SELECT "Id", "FullName", "Email", "ResetTokenExpiry" FROM "Admins" WHERE "ResetToken" = $1 AND "IsActive" = TRUE`, [token]);
    if (adminResult.rows.length === 0) return res.status(400).json({ success: false, error: 'Invalid token.' });

    const admin = adminResult.rows[0];
    if (new Date(admin.ResetTokenExpiry) < new Date()) {
      await pool.query(`UPDATE "Admins" SET "ResetToken" = NULL, "ResetTokenExpiry" = NULL WHERE "Id" = $1`, [admin.Id]);
      return res.status(400).json({ success: false, error: 'Token expired.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE "Admins" SET "PasswordHash" = $1, "IsTempPassword" = FALSE, "ResetToken" = NULL, "ResetTokenExpiry" = NULL WHERE "Id" = $2`, [newHash, admin.Id]);

    sendPasswordChangedConfirmation(admin.Email, admin.FullName);
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

export default router;
