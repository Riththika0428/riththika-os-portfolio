import nodemailer from "nodemailer";

// Email alerts are optional. Set these in server/.env to turn them on:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL   (MAIL_FROM is optional)
// If any required one is missing the feature is simply off and nothing breaks.

const clean = (s, max) => String(s ?? "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

export function getMailConfig(env = process.env) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL, MAIL_FROM } = env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) return null;
  const port = Number(SMTP_PORT) || 587;
  return { host: SMTP_HOST, port, secure: port === 465, user: SMTP_USER, pass: SMTP_PASS, to: NOTIFY_EMAIL, from: MAIL_FROM || SMTP_USER };
}

let transporter; // created lazily, once
let override; // tests can inject a transport
export const _setTransportForTests = (t) => { override = t; transporter = undefined; };

function getTransporter(cfg) {
  if (override) return override;
  transporter ??= nodemailer.createTransport({
    host: cfg.host, port: cfg.port, secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
  });
  return transporter;
}

export function buildContactEmail(entry, cfg) {
  const name = clean(entry.name, 80), email = clean(entry.email, 120), subject = clean(entry.subject, 120);
  return {
    from: `"Portfolio alerts" <${cfg.from}>`, // a fixed sender name, never the visitor's input
    to: cfg.to,
    replyTo: email || undefined,
    subject: `New portfolio message from ${name || "someone"}${subject ? `: ${subject}` : ""}`.slice(0, 200),
    text: `From: ${name} <${email}>\nSubject: ${subject || "(none)"}\n\n${String(entry.message ?? "").slice(0, 5000)}\n\n— Open the admin Messages page to reply or mark it read.`,
  };
}

// Never throws and never waits for the caller: a mail problem must not break the contact form.
export function notifyNewMessage(entry, env = process.env) {
  const cfg = getMailConfig(env);
  if (!cfg) return Promise.resolve(false);
  return getTransporter(cfg)
    .sendMail(buildContactEmail(entry, cfg))
    .then(() => true)
    .catch((err) => {
      console.error("[mail] could not send contact alert:", err?.code || err?.message || "unknown error");
      return false;
    });
}