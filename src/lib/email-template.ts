import type { AttachmentMeta, RequestFormValues } from "@/lib/schema";
import { formatBytes } from "@/lib/schema";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(input: string): string {
  return escapeHtml(input).replace(/\r?\n/g, "<br />");
}

export function buildRequestEmailHtml(
  data: RequestFormValues,
  attachments: AttachmentMeta[] = []
): string {
  const name = escapeHtml(data.name);
  const company = data.company ? escapeHtml(data.company) : "";
  const email = data.email ? escapeHtml(data.email) : "";
  const phone = data.phone ? escapeHtml(data.phone) : "";
  const description = nl2br(data.description);
  const submittedAt = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "full",
    timeStyle: "short",
  });

  const attachmentsRow =
    attachments.length > 0
      ? `<tr>
            <td style="padding:20px 32px 0 32px;">
              <h2 style="margin:0 0 12px 0;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;">Lampiran (${attachments.length})</h2>
              <ul style="margin:0;padding:0;list-style:none;">
                ${attachments
                  .map(
                    (a) =>
                      `<li style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:6px;background:#0B0D12;border:1px solid #1F2330;border-radius:10px;font-size:13px;color:#E5E7EB;">
                         <span style="font-weight:600;">${escapeHtml(a.filename)}</span>
                         <span style="margin-left:auto;color:#9CA3AF;font-size:12px;">${escapeHtml(a.mimeType)} · ${formatBytes(a.size)}</span>
                       </li>`
                  )
                  .join("")}
              </ul>
            </td>
          </tr>`
      : "";

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Permintaan Pembuatan Website Baru</title>
  </head>
  <body style="margin:0;padding:0;background:#0B0D12;font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#E5E7EB;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0D12;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#11141B;border:1px solid #1F2330;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#1A1E29 0%,#11141B 100%);border-bottom:1px solid #1F2330;">
                <div style="display:inline-block;padding:6px 12px;border:1px solid #2A2F3D;border-radius:999px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#C4B5FD;">Taka Ticket &middot; New Lead</div>
                <h1 style="margin:14px 0 6px 0;font-size:22px;font-weight:600;color:#F9FAFB;">Permintaan Pembuatan Website Baru</h1>
                <p style="margin:0;font-size:13px;color:#9CA3AF;">Diterima pada ${submittedAt} WIB</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <h2 style="margin:0 0 12px 0;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;">Informasi Klien</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #1F2330;color:#9CA3AF;font-size:13px;width:140px;">Nama Lengkap</td>
                    <td style="padding:10px 0;border-bottom:1px solid #1F2330;color:#F9FAFB;font-size:14px;">${name}</td>
                  </tr>
                  ${
                    company
                      ? `<tr>
                    <td style="padding:10px 0;border-bottom:1px solid #1F2330;color:#9CA3AF;font-size:13px;">Perusahaan</td>
                    <td style="padding:10px 0;border-bottom:1px solid #1F2330;color:#F9FAFB;font-size:14px;">${company}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    email
                      ? `<tr>
                    <td style="padding:10px 0;border-bottom:1px solid #1F2330;color:#9CA3AF;font-size:13px;">Email</td>
                    <td style="padding:10px 0;border-bottom:1px solid #1F2330;color:#F9FAFB;font-size:14px;"><a href="mailto:${email}" style="color:#C4B5FD;text-decoration:none;">${email}</a></td>
                  </tr>`
                      : ""
                  }
                  ${
                    phone
                      ? `<tr>
                    <td style="padding:10px 0;border-bottom:1px solid #1F2330;color:#9CA3AF;font-size:13px;">WhatsApp / Telepon</td>
                    <td style="padding:10px 0;border-bottom:1px solid #1F2330;color:#F9FAFB;font-size:14px;">${phone}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 8px 32px;">
                <h2 style="margin:0 0 12px 0;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#9CA3AF;">Deskripsi Proyek</h2>
                <div style="padding:16px 18px;background:#0B0D12;border:1px solid #1F2330;border-radius:12px;color:#E5E7EB;font-size:14px;line-height:1.7;">
                  ${description}
                </div>
              </td>
            </tr>
            ${attachmentsRow}
            <tr>
              <td style="padding:18px 32px;background:#0B0D12;border-top:1px solid #1F2330;">
                <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.6;">
                  Email ini dikirim otomatis oleh sistem Taka Ticket Website Request.<br/>
                  Balas langsung untuk menghubungi klien.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildRequestEmailText(
  data: RequestFormValues,
  attachments: AttachmentMeta[] = []
): string {
  const lines = [
    "Permintaan Pembuatan Website Baru - Taka Ticket",
    "==========================================",
    "",
    `Nama Lengkap : ${data.name}`,
  ];
  if (data.company) lines.push(`Perusahaan   : ${data.company}`);
  if (data.email) lines.push(`Email        : ${data.email}`);
  if (data.phone) lines.push(`WhatsApp/Tel : ${data.phone}`);
  lines.push("", "Deskripsi Proyek:", data.description, "");
  if (attachments.length > 0) {
    lines.push(`Lampiran (${attachments.length}):`);
    for (const a of attachments) {
      lines.push(`  - ${a.filename} (${a.mimeType}, ${formatBytes(a.size)})`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
