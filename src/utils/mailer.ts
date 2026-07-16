import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "node:dns";

// Render's free tier lacks outbound IPv6 routing, causing ENETUNREACH errors with Gmail.
// This forces Node.js to use IPv4 for all network requests.
dns.setDefaultResultOrder('ipv4first');

dotenv.config({ path: '.env.local' });

let transporter: nodemailer.Transporter | null = null;

if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_USER !== "your_email@gmail.com") {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  console.log("[Mailer] Gmail SMTP transporter initialized.");
} else {
  console.warn("[Mailer] GMAIL_USER or GMAIL_APP_PASSWORD is missing or invalid. Emails will only be simulated.");
}

// ─── Haven Stay branded email wrapper ───
function wrapInBrandedEmail(bodyContent: string): string {
  return `
    <div style="font-family: 'Georgia', serif; background-color: #09090b; color: #d4d4d8; max-width: 600px; margin: 0 auto; border: 1px solid #27272a; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #78350f 0%, #451a03 100%); padding: 28px 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold; color: #fef3c7; letter-spacing: 2px; text-transform: uppercase;">
          🏔️ Haven Stay Portal
        </h1>
        <p style="margin: 6px 0 0; font-size: 11px; color: #d97706; letter-spacing: 3px; text-transform: uppercase; font-family: monospace;">
          KASHMIR VALLEY SANCTUARY
        </p>
      </div>
      <!-- Body -->
      <div style="padding: 32px;">
        ${bodyContent}
      </div>
      <!-- Footer -->
      <div style="border-top: 1px solid #27272a; padding: 20px 32px; text-align: center; background-color: #18181b;">
        <p style="margin: 0; font-size: 11px; color: #71717a; font-family: monospace;">
          This is an automated message from Haven Stay Portal. Please do not reply directly.
        </p>
        <p style="margin: 8px 0 0; font-size: 10px; color: #52525b;">
          © ${new Date().getFullYear()} Haven Retreat — Kashmir Valley, India
        </p>
      </div>
    </div>
  `;
}

// ─── Send Temporary Password Email ───
export async function sendTempPasswordEmail(to: string, fullName: string, tempPassword: string): Promise<boolean> {
  const htmlBody = wrapInBrandedEmail(`
    <h2 style="margin: 0 0 8px; font-size: 20px; color: #f5f5f4; font-family: Georgia, serif;">
      Welcome to the Team, ${fullName}
    </h2>
    <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px;">
      You have been granted administrator access to the Haven Stay Portal. Use the credentials below to log in for the first time.
    </p>
    
    <div style="background-color: #18181b; border: 1px solid #3f3f46; border-left: 4px solid #d97706; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 12px; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-family: monospace;">
        Your Login Credentials
      </p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #e4e4e7;">
        <strong style="color: #a1a1aa;">Email:</strong> <span style="color: #fbbf24;">${to}</span>
      </p>
      <p style="margin: 0; font-size: 14px; color: #e4e4e7;">
        <strong style="color: #a1a1aa;">Temporary Password:</strong> <code style="background: #27272a; padding: 3px 8px; border-radius: 4px; color: #fbbf24; font-size: 16px; letter-spacing: 1px;">${tempPassword}</code>
      </p>
    </div>

    <div style="background-color: #451a03; border: 1px solid #78350f; border-radius: 6px; padding: 14px 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 12px; color: #fcd34d;">
        ⚠️ <strong>Important:</strong> You will be required to change this password upon your first login. This temporary password will expire once changed.
      </p>
    </div>

    <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 20px 0 0;">
      If you did not expect this invitation, please contact your system administrator immediately.
    </p>
  `);

  const logFallback = () => {
    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║  📧 ADMIN CREDENTIALS (SMTP unavailable)         ║`);
    console.log(`╠══════════════════════════════════════════════════╣`);
    console.log(`║  TO:        ${to}`);
    console.log(`║  NAME:      ${fullName}`);
    console.log(`║  PASSWORD:  ${tempPassword}`);
    console.log(`╚══════════════════════════════════════════════════╝\n`);
  };

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Haven Stay Portal" <${process.env.GMAIL_USER}>`,
        to,
        subject: '🔑 Your Haven Stay Portal Admin Credentials',
        html: htmlBody
      });
      console.log(`[Mailer] ✅ Temporary password email sent to ${to}`);
      return true;
    } catch (err) {
      console.warn(`[Mailer] ⚠️ SMTP failed for ${to}. Falling back to log output.`);
      logFallback();
      return true;
    }
  } else {
    logFallback();
    return true;
  }
}

// ─── Send Password Reset Email ───
export async function sendPasswordResetEmail(to: string, fullName: string, resetLink: string): Promise<boolean> {
  const htmlBody = wrapInBrandedEmail(`
    <h2 style="margin: 0 0 8px; font-size: 20px; color: #f5f5f4; font-family: Georgia, serif;">
      Password Reset Request
    </h2>
    <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px;">
      Hello ${fullName}, we received a request to reset your password for the Haven Stay Portal administrator panel.
    </p>
    
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #09090b; font-weight: bold; font-size: 13px; padding: 14px 32px; border-radius: 6px; text-decoration: none; letter-spacing: 1px; text-transform: uppercase; font-family: monospace;">
        Reset Your Password
      </a>
    </div>

    <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 6px; padding: 14px 16px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-family: monospace;">
        Or copy this link
      </p>
      <p style="margin: 0; font-size: 11px; color: #60a5fa; word-break: break-all; font-family: monospace;">
        ${resetLink}
      </p>
    </div>

    <div style="background-color: #451a03; border: 1px solid #78350f; border-radius: 6px; padding: 14px 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 12px; color: #fcd34d;">
        ⏰ <strong>This link expires in 1 hour.</strong> If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
      </p>
    </div>

    <p style="font-size: 12px; color: #71717a; line-height: 1.6; margin: 20px 0 0;">
      For security reasons, never share this link with anyone.
    </p>
  `);

  const logFallback = () => {
    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║  📧 PASSWORD RESET (SMTP unavailable)            ║`);
    console.log(`╠══════════════════════════════════════════════════╣`);
    console.log(`║  TO:    ${to}`);
    console.log(`║  NAME:  ${fullName}`);
    console.log(`║  LINK:  ${resetLink}`);
    console.log(`╚══════════════════════════════════════════════════╝\n`);
  };

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Haven Stay Portal" <${process.env.GMAIL_USER}>`,
        to,
        subject: '🔒 Password Reset — Haven Stay Portal',
        html: htmlBody
      });
      console.log(`[Mailer] ✅ Password reset email sent to ${to}`);
      return true;
    } catch (err) {
      console.warn(`[Mailer] ⚠️ SMTP failed for ${to}. Falling back to log output.`);
      logFallback();
      return true;
    }
  } else {
    logFallback();
    return true;
  }
}

// ─── Send Password Changed Confirmation ───
export async function sendPasswordChangedConfirmation(to: string, fullName: string): Promise<boolean> {
  const htmlBody = wrapInBrandedEmail(`
    <h2 style="margin: 0 0 8px; font-size: 20px; color: #f5f5f4; font-family: Georgia, serif;">
      Password Changed Successfully
    </h2>
    <p style="font-size: 13px; color: #a1a1aa; line-height: 1.6; margin: 0 0 20px;">
      Hello ${fullName}, your Haven Stay Portal administrator password has been successfully updated.
    </p>
    
    <div style="background-color: #052e16; border: 1px solid #166534; border-radius: 6px; padding: 16px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: #86efac; font-weight: bold;">
        ✅ Your password has been changed
      </p>
      <p style="margin: 8px 0 0; font-size: 12px; color: #4ade80;">
        at ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
      </p>
    </div>

    <div style="background-color: #451a03; border: 1px solid #78350f; border-radius: 6px; padding: 14px 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 12px; color: #fcd34d;">
        🚨 <strong>If you did not make this change</strong>, please contact your system administrator immediately and reset your password.
      </p>
    </div>
  `);

  const logFallback = () => {
    console.log(`\n╔══════════════════════════════════════════════════╗`);
    console.log(`║  📧 PASSWORD CHANGED (SMTP unavailable)          ║`);
    console.log(`╠══════════════════════════════════════════════════╣`);
    console.log(`║  TO:    ${to}`);
    console.log(`║  NAME:  ${fullName}`);
    console.log(`║  STATUS: Password changed successfully`);
    console.log(`╚══════════════════════════════════════════════════╝\n`);
  };

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Haven Stay Portal" <${process.env.GMAIL_USER}>`,
        to,
        subject: '✅ Password Changed — Haven Stay Portal',
        html: htmlBody
      });
      console.log(`[Mailer] ✅ Password changed confirmation sent to ${to}`);
      return true;
    } catch (err) {
      console.warn(`[Mailer] ⚠️ SMTP failed for ${to}. Falling back to log output.`);
      logFallback();
      return true;
    }
  } else {
    logFallback();
    return true;
  }
}

export { transporter };
