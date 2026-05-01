"use server";

import {
  requestFormSchema,
  validateFiles,
  type AttachmentMeta,
  type RequestFormValues,
} from "@/lib/schema";
import {
  buildRequestEmailHtml,
  buildRequestEmailText,
} from "@/lib/email-template";
import { getMailFrom, getMailTo, getTransporter } from "@/lib/mailer";

export type SubmitRequestResult =
  | { ok: true; message: string; attachmentsCount: number }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

function getFormString(form: FormData, key: string): string {
  const value = form.get(key);
  if (typeof value !== "string") return "";
  return value;
}

function getFormFiles(form: FormData, key: string): File[] {
  const all = form.getAll(key);
  return all.filter((v): v is File => v instanceof File && v.size > 0);
}

export async function submitRequestAction(
  formData: FormData
): Promise<SubmitRequestResult> {
  const values: RequestFormValues = {
    name: getFormString(formData, "name"),
    description: getFormString(formData, "description"),
    email: getFormString(formData, "email"),
    phone: getFormString(formData, "phone"),
    company: getFormString(formData, "company"),
  };

  const parsed = requestFormSchema.safeParse(values);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      message: "Validasi gagal. Periksa kembali data yang kamu masukkan.",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    };
  }
  const data = parsed.data;

  const incomingFiles = getFormFiles(formData, "files");
  const fileResult = validateFiles(incomingFiles);
  if (!fileResult.ok) {
    return {
      ok: false,
      message:
        "Lampiran tidak valid: " +
        fileResult.errors.map((e) => `${e.filename}: ${e.message}`).join("; "),
    };
  }

  // Build Nodemailer attachments + metadata for email body
  const attachments: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[] = [];
  const meta: AttachmentMeta[] = [];

  for (const file of fileResult.files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    attachments.push({
      filename: file.name,
      content: buffer,
      contentType: file.type || undefined,
    });
    meta.push({
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
    });
  }

  try {
    const transporter = getTransporter();
    const html = buildRequestEmailHtml(data, meta);
    const text = buildRequestEmailText(data, meta);

    const replyTo = data.email ? data.email : undefined;
    const subjectName = data.company
      ? `${data.name} (${data.company})`
      : data.name;

    await transporter.sendMail({
      from: getMailFrom(),
      to: getMailTo(),
      replyTo,
      subject: `[Taka Ticket] Permintaan Website Baru - ${subjectName}`,
      html,
      text,
      attachments,
    });

    return {
      ok: true,
      message:
        "Terima kasih! Permintaanmu sudah kami terima. Tim Taka Ticket akan menghubungi kamu segera.",
      attachmentsCount: meta.length,
    };
  } catch (error) {
    console.error("[submitRequestAction] Failed to send email:", error);
    return {
      ok: false,
      message:
        "Maaf, terjadi kesalahan saat mengirim permintaan. Silakan coba lagi atau hubungi kami secara manual.",
    };
  }
}
