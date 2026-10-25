process.env.ADMIN_AUTH_SECRET = "t".repeat(48); process.env.NODE_ENV = "test";
const { ContactMessage } = await import("../src/models/ContactMessage.js");
const mailer = await import("../src/utils/mailer.js");
const { createApp } = await import("../src/app.js");
let fails = 0; const ok = (n, c) => { console.log(c ? "PASS" : "FAIL", n); if (!c) fails++; };
const ENV = { SMTP_HOST: "smtp.x.com", SMTP_USER: "me@x.com", SMTP_PASS: "pw", NOTIFY_EMAIL: "owner@x.com" };
const entry = { _id: "1", name: "Eve\r\nBcc: evil@x.com", email: "eve@y.com", subject: "Hi\nthere", message: "hello" };

ok("off without config", mailer.getMailConfig({}) === null && mailer.getMailConfig({ ...ENV, SMTP_PASS: "" }) === null);
ok("off -> resolves false, no send", (await mailer.notifyNewMessage(entry, {})) === false);
const cfg = mailer.getMailConfig(ENV);
ok("defaults: port 587, not secure, from = user", cfg.port === 587 && !cfg.secure && cfg.from === "me@x.com");
ok("port 465 is secure", mailer.getMailConfig({ ...ENV, SMTP_PORT: "465" }).secure === true);
const mail = mailer.buildContactEmail(entry, cfg);
ok("recipient comes from env only", mail.to === "owner@x.com");
ok("no header injection (subject)", !/[\r\n]/.test(mail.subject) && mail.subject.includes("Eve Bcc: evil@x.com"));
ok("replyTo is the visitor", mail.replyTo === "eve@y.com");
ok("sender name is fixed", mail.from.startsWith('"Portfolio alerts"'));

const sent = []; mailer._setTransportForTests({ sendMail: async (m) => { sent.push(m); } });
ok("sends via transport", (await mailer.notifyNewMessage(entry, ENV)) === true && sent.length === 1);
mailer._setTransportForTests({ sendMail: async () => { throw Object.assign(new Error("boom secret"), { code: "ECONNECTION" }); } });
const origErr = console.error; let logged = ""; console.error = (...a) => { logged += a.join(" "); };
ok("SMTP failure resolves false, never throws", (await mailer.notifyNewMessage(entry, ENV)) === false);
console.error = origErr;
ok("failure log has no password/message text", !logged.includes("pw") && logged.includes("ECONNECTION"));

// End to end: the contact form still answers 201 when mail breaks, and when it works
process.env.CLIENT_URL = "http://localhost:3000";
Object.assign(process.env, ENV);
ContactMessage.create = async (d) => ({ _id: { toString: () => "abc" }, ...d });
const app = createApp({ allowedOrigins: ["http://localhost:3000"] });
const server = app.listen(0); const base = `http://localhost:${server.address().port}`;
const post = () => fetch(`${base}/api/contact`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" }, body: JSON.stringify({ name: "Eve", email: "eve@y.com", subject: "Hello", message: "A real message here." }) });
sent.length = 0;
mailer._setTransportForTests({ sendMail: async () => { throw new Error("down"); } });
console.error = () => {};
let r = await post(); ok("mail down -> still 201", r.status === 201);
console.error = origErr;
mailer._setTransportForTests({ sendMail: async (m) => { sent.push(m); } });
r = await post(); await new Promise((x) => setTimeout(x, 30));
ok("mail up -> 201 and one email", r.status === 201 && sent.length === 1 && sent[0].text.includes("A real message here."));
mailer._setTransportForTests({ sendMail: () => new Promise(() => {}) }); // hangs forever
const t0 = Date.now(); r = await post();
ok("hanging mail server does not delay the response", r.status === 201 && Date.now() - t0 < 1000);
server.close(); console.log(fails ? `\n${fails} FAILED` : "\nALL PASSED"); process.exit(fails ? 1 : 0);