import { z } from "zod";

const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB / file
export const MAX_TOTAL_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB total
export const MAX_FILES = 5;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

export const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
  ".pdf",
];

export const ACCEPT_ATTRIBUTE = "image/*,application/pdf";

export const requestFormSchema = z
  .object({
    name: z
      .string({ required_error: "Nama lengkap wajib diisi." })
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter.")
      .max(100, "Nama lengkap maksimal 100 karakter."),
    description: z
      .string({ required_error: "Deskripsi proyek wajib diisi." })
      .trim()
      .min(20, "Deskripsi proyek minimal 20 karakter.")
      .max(5000, "Deskripsi proyek maksimal 5000 karakter."),
    email: z
      .string()
      .trim()
      .email("Format email tidak valid.")
      .max(254)
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Format nomor telepon tidak valid.")
      .optional()
      .or(z.literal("")),
    company: z.string().trim().max(120).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasEmail = !!data.email && data.email.length > 0;
    const hasPhone = !!data.phone && data.phone.length > 0;
    if (!hasEmail && !hasPhone) {
      const message =
        "Mohon isi minimal salah satu kontak: Email atau Nomor WhatsApp/Telepon.";
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message,
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message,
      });
    }
  });

export type RequestFormValues = z.infer<typeof requestFormSchema>;

export type AttachmentMeta = {
  filename: string;
  size: number;
  mimeType: string;
};

export type FileValidationError = {
  filename: string;
  message: string;
};

export type FileValidationResult =
  | { ok: true; files: File[] }
  | { ok: false; errors: FileValidationError[] };

function isAllowedMime(mime: string): boolean {
  if (mime === "application/pdf") return true;
  if (mime.startsWith("image/")) return true;
  return false;
}

function hasAllowedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function validateFiles(files: File[]): FileValidationResult {
  const errors: FileValidationError[] = [];

  if (files.length > MAX_FILES) {
    errors.push({
      filename: "(global)",
      message: `Maksimal ${MAX_FILES} file per submit.`,
    });
  }

  let totalSize = 0;
  for (const f of files) {
    totalSize += f.size;
    if (f.size > MAX_FILE_SIZE_BYTES) {
      errors.push({
        filename: f.name,
        message: `Ukuran file melebihi ${formatBytes(MAX_FILE_SIZE_BYTES)} per file.`,
      });
    }
    if (!isAllowedMime(f.type) && !hasAllowedExtension(f.name)) {
      errors.push({
        filename: f.name,
        message: "Hanya gambar (JPG/PNG/WEBP/GIF/HEIC) atau PDF yang diizinkan.",
      });
    }
  }

  if (totalSize > MAX_TOTAL_SIZE_BYTES) {
    errors.push({
      filename: "(global)",
      message: `Total ukuran semua file melebihi ${formatBytes(MAX_TOTAL_SIZE_BYTES)}.`,
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, files };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
