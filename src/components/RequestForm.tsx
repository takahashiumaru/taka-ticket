"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ACCEPT_ATTRIBUTE,
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  MAX_TOTAL_SIZE_BYTES,
  formatBytes,
  requestFormSchema,
  validateFiles,
  type RequestFormValues,
} from "@/lib/schema";
import { submitRequestAction } from "@/app/actions/submit-request";

type FilePreview = { url: string | null; isImage: boolean };

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function RequestForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Build (and cleanup) object URLs for image previews.
  const previews = useMemo<FilePreview[]>(
    () =>
      files.map((f) => {
        const isImage = f.type.startsWith("image/");
        return {
          isImage,
          url: isImage ? URL.createObjectURL(f) : null,
        };
      }),
    [files]
  );

  useEffect(() => {
    return () => {
      for (const p of previews) {
        if (p.url) URL.revokeObjectURL(p.url);
      }
    };
  }, [previews]);

  // Close lightbox on Escape and lock scroll
  useEffect(() => {
    if (lightboxIndex === null) {
      document.body.style.overflow = "unset";
      return;
    }
    document.body.style.overflow = "hidden";
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      description: "",
    },
  });

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  const handleFilesAdded = (newFiles: File[]) => {
    const merged = [...files];
    for (const f of newFiles) {
      if (merged.some((m) => m.name === f.name && m.size === f.size)) continue;
      merged.push(f);
    }
    const result = validateFiles(merged);
    if (!result.ok) {
      setFileError(result.errors.map((e) => e.message).join(" "));
      return;
    }
    setFileError(null);
    setFiles(result.files);
  };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    handleFilesAdded(Array.from(list));
    // Allow re-selecting the same file later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = Array.from(e.dataTransfer.files ?? []);
    if (dropped.length === 0) return;
    handleFilesAdded(dropped);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  const onSubmit = (values: RequestFormValues) => {
    // Re-validate files just in case
    const result = validateFiles(files);
    if (!result.ok) {
      setFileError(result.errors.map((e) => e.message).join(" "));
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("email", values.email ?? "");
    formData.append("phone", values.phone ?? "");
    formData.append("company", values.company ?? "");
    for (const file of files) {
      formData.append("files", file, file.name);
    }

    startTransition(async () => {
      const toastId = toast.loading("Mengirim permintaan...");
      try {
        const res = await submitRequestAction(formData);
        if (res.ok) {
          toast.success(res.message, { id: toastId, duration: 5000 });
          reset();
          setFiles([]);
          setFileError(null);
          setSubmitted(true);
        } else {
          toast.error(res.message, { id: toastId, duration: 6000 });
        }
      } catch (err) {
        console.error(err);
        toast.error(
          "Terjadi kesalahan tak terduga. Silakan coba lagi sebentar.",
          { id: toastId }
        );
      }
    });
  };

  return (
    <div className="glass-card p-6 sm:p-8 lg:p-10">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            {...fadeUp}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/10 text-emerald-300">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">
              Permintaan Terkirim
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/60">
              Tim Taka Ticket akan meninjau brief kamu dan menghubungi via
              kontak yang kamu cantumkan dalam 1x24 jam kerja.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 text-sm font-medium text-accent-soft underline-offset-4 transition hover:text-white hover:underline"
            >
              Kirim permintaan lain
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            {...fadeUp}
            transition={{ duration: 0.35, ease: "easeOut" }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="field-label">
                  Nama Lengkap <span className="text-rose-300">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Contoh: Bella Wardana"
                  className="glass-input"
                  aria-invalid={!!errors.name}
                  disabled={isPending}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="field-error">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="company" className="field-label">
                  Perusahaan <span className="text-white/30">(opsional)</span>
                </label>
                <input
                  id="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Nama brand atau bisnis"
                  className="glass-input"
                  aria-invalid={!!errors.company}
                  disabled={isPending}
                  {...register("company")}
                />
                {errors.company && (
                  <p className="field-error">{errors.company.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="field-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@domain.com"
                  className="glass-input"
                  aria-invalid={!!errors.email}
                  disabled={isPending}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="field-error">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="field-label">
                  WhatsApp / Telepon
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+62 812 3456 7890"
                  className="glass-input"
                  aria-invalid={!!errors.phone}
                  disabled={isPending}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="field-error">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-white/45">
              Isi minimal salah satu kontak: <strong>Email</strong> atau{" "}
              <strong>WhatsApp/Telepon</strong>.
            </p>

            <div>
              <label htmlFor="description" className="field-label">
                Deskripsi Kebutuhan / Project{" "}
                <span className="text-rose-300">*</span>
              </label>
              <textarea
                id="description"
                placeholder="Ceritakan tujuan website, target audiens, fitur utama, referensi desain, timeline, dan budget jika ada."
                className="glass-textarea"
                aria-invalid={!!errors.description}
                disabled={isPending}
                {...register("description")}
              />
              {errors.description && (
                <p className="field-error">{errors.description.message}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="files" className="field-label">
                Image Pendukung{" "}
                <span className="text-white/30">(opsional)</span>
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={onDrop}
                className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 transition hover:border-accent/50 hover:bg-white/[0.05]"
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <UploadIcon />
                  <div className="text-sm text-white/80">
                    Drag &amp; drop atau{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="font-semibold text-accent-soft underline-offset-4 hover:text-white hover:underline"
                      disabled={isPending}
                    >
                      pilih file
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-white/45">
                    Gambar (JPG/PNG/WEBP/GIF/HEIC) atau PDF · maks {MAX_FILES}{" "}
                    file · {formatBytes(MAX_FILE_SIZE_BYTES)} per file ·{" "}
                    {formatBytes(MAX_TOTAL_SIZE_BYTES)} total
                  </p>
                </div>
                <input
                  id="files"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPT_ATTRIBUTE}
                  className="sr-only"
                  onChange={onPickFiles}
                  disabled={isPending}
                />
              </div>

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => {
                    const preview = previews[i];
                    return (
                      <li
                        key={`${f.name}-${f.size}-${i}`}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
                      >
                        {preview?.isImage && preview.url ? (
                          <button
                            type="button"
                            onClick={() => setLightboxIndex(i)}
                            className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-black/40 transition hover:ring-2 hover:ring-accent/60"
                            aria-label={`Preview ${f.name}`}
                            disabled={isPending}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview.url}
                              alt={f.name}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                              <ZoomIcon />
                            </span>
                          </button>
                        ) : (
                          <FileIcon mime={f.type} />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm text-white">
                            {f.name}
                          </div>
                          <div className="text-[11px] text-white/45">
                            {f.type || "unknown"} · {formatBytes(f.size)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="rounded-full p-1 text-white/40 transition hover:bg-white/10 hover:text-rose-300"
                          aria-label={`Hapus ${f.name}`}
                          disabled={isPending}
                        >
                          <CloseIcon />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {files.length > 0 && (
                <p className="mt-2 text-[11px] text-white/45">
                  {files.length} file · total {formatBytes(totalSize)}
                </p>
              )}

              {fileError && <p className="field-error">{fileError}</p>}
            </div>

            <div className="flex flex-col items-start justify-between gap-3 pt-2 sm:flex-row sm:items-center">
              <p className="text-xs text-white/45">
                Dengan mengirim form ini kamu setuju untuk dihubungi tim Taka
                Ticket.
              </p>
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Spinner />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Permintaan</span>
                    <ArrowRight />
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightboxIndex !== null && previews[lightboxIndex]?.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur-xl transition hover:bg-white/20 hover:scale-110 active:scale-95"
                aria-label="Tutup preview"
              >
                <CloseIcon />
              </button>
              
              <div className="relative max-h-[75vh] max-w-[92vw] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[lightboxIndex]!.url!}
                  alt={files[lightboxIndex]?.name ?? "Preview"}
                  className="max-h-[75vh] max-w-[92vw] object-contain"
                />
              </div>

              <div className="mt-4 rounded-full bg-black/40 px-3 py-1 text-center text-xs font-medium text-white/80 backdrop-blur-md">
                {files[lightboxIndex]?.name}
                {" · "}
                {formatBytes(files[lightboxIndex]?.size ?? 0)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ZoomIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent-soft"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="m6 10 6-6 6 6" />
      <path d="M4 20h16" />
    </svg>
  );
}

function FileIcon({ mime }: { mime: string }) {
  const isPdf = mime === "application/pdf";
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
        isPdf
          ? "border-rose-300/20 bg-rose-400/10 text-rose-200"
          : "border-violet-300/20 bg-violet-400/10 text-violet-200"
      }`}
      aria-hidden="true"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isPdf ? (
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9z" />
            <path d="M14 13h2v3" />
          </>
        ) : (
          <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.5-3.5L9 20" />
          </>
        )}
      </svg>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
