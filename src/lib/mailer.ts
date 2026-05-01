import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT ?? 587);
  const user = process.env.MAIL_USERNAME;
  const pass = process.env.MAIL_PASSWORD;
  const encryption = (process.env.MAIL_ENCRYPTION ?? "tls").toLowerCase();

  if (!host || !user || !pass) {
    throw new Error(
      "Konfigurasi SMTP belum lengkap. Pastikan MAIL_HOST, MAIL_USERNAME, dan MAIL_PASSWORD sudah diisi pada .env.local."
    );
  }

  // Port 465 -> SSL implicit, port 587 -> STARTTLS (secure: false + requireTLS)
  const secure = port === 465 || encryption === "ssl";

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure && encryption === "tls",
    auth: { user, pass },
    // Bail out fast if the SMTP host is unreachable (e.g. firewall blocking
    // outbound port). Without these, Nodemailer can hang indefinitely and
    // cause the Server Action to time out with a non-graceful error.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return cachedTransporter;
}

export function getMailFromName(): string {
  return process.env.MAIL_FROM_NAME ?? "Taka Ticket";
}

export function getMailFrom(): string {
  const fromName = getMailFromName();
  const fromAddress =
    process.env.MAIL_FROM_ADDRESS ?? process.env.MAIL_USERNAME ?? "";
  return `"${fromName.replace(/"/g, "")}" <${fromAddress}>`;
}

export function getMailTo(): string {
  return process.env.MAIL_TO_ADDRESS ?? "umarmarufmutaqin@gmail.com";
}
