import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
  tls: { rejectUnauthorized: false },
});

// Verify transporter at startup (silent) to avoid noisy logs
transporter.verify().catch(() => {});

export default transporter;