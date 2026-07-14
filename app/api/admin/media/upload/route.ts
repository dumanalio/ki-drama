import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { AdminAuthError, requireAdmin } from "@/lib/auth/require-admin";
import {
  ACCEPTED_UPLOAD_TYPES,
  extensionForMimeType,
  MAX_UPLOAD_BYTES,
} from "@/lib/media-constants";

const MEDIA_BUCKET = "media";

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
      { error: "Es wurde keine Datei übermittelt." },
      { status: 400 }
    );
  }
  if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error:
          "Dieses Dateiformat wird nicht unterstützt. Erlaubt sind Bilder (JPEG, PNG, WebP, GIF) und Videos (MP4, WebM).",
      },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Die Datei ist zu groß (maximal 20 MB)." },
      { status: 400 }
    );
  }

  const extension = extensionForMimeType(file.type) ?? "jpg";
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
