import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";

const MEDIA_BUCKET = "media";
const MAX_FILE_BYTES = 15 * 1024 * 1024;

export async function POST(request: Request) {
  let adminClient;
  try {
    ({ adminClient } = await requireAdmin());
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: "Kein Zugriff. Bitte melde dich erneut an." },
        { status: 403 }
      );
    }
    throw error;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Es wurde keine Bilddatei übermittelt." },
      { status: 400 }
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Nur Bilddateien können hochgeladen werden." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "Die Datei ist zu groß (maximal 15 MB)." },
      { status: 400 }
    );
  }

  const extension = file.type === "image/webp" ? "webp" : "jpg";
  const path = `uploads/${randomUUID()}.${extension}`;

  const { error: uploadError } = await adminClient.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error(
      "[api/admin/media/upload] Upload fehlgeschlagen:",
      uploadError
    );
    return NextResponse.json(
      {
        error:
          "Das Bild konnte nicht hochgeladen werden. Bitte versuche es erneut.",
      },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = adminClient.storage.from(MEDIA_BUCKET).getPublicUrl(path);

  return NextResponse.json({ path, url: publicUrl });
}
