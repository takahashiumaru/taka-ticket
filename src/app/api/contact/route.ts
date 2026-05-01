import { NextResponse } from "next/server";
import { submitRequestAction } from "@/app/actions/submit-request";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let formData: FormData;
  try {
    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();
    } else if (contentType.includes("application/json")) {
      // Allow legacy JSON callers — convert to FormData (no file uploads).
      const json = (await request.json()) as Record<string, unknown>;
      formData = new FormData();
      for (const [key, value] of Object.entries(json)) {
        if (value === undefined || value === null) continue;
        formData.append(key, String(value));
      }
    } else {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Content-Type harus multipart/form-data atau application/json.",
        },
        { status: 415 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, message: "Body request tidak valid." },
      { status: 400 }
    );
  }

  const result = await submitRequestAction(formData);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
