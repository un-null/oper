import "server-only";

import { PHOTO_EXTENSION_BY_TYPE } from "@/lib/validation";

const BUCKET = "item_photos";

export type UploadResult =
  | { ok: true; urls: string[] }
  | { ok: false; reason: "config" | "network" | "rejected" };

export async function uploadItemPhotos(userId: string, files: File[]): Promise<UploadResult> {
  const baseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) {
    return { ok: false, reason: "config" };
  }

  try {
    const urls = await Promise.all(
      files.map((file) => uploadOne(baseUrl, serviceKey, userId, file)),
    );
    return { ok: true, urls };
  } catch (error) {
    return { ok: false, reason: error instanceof NetworkError ? "network" : "rejected" };
  }
}

class NetworkError extends Error {}

async function uploadOne(
  baseUrl: string,
  serviceKey: string,
  userId: string,
  file: File,
): Promise<string> {
  const ext = PHOTO_EXTENSION_BY_TYPE[file.type];
  if (!ext) {
    throw new Error("unsupported photo type");
  }

  const objectPath = `${userId}/${crypto.randomUUID()}.${ext}`;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/storage/v1/object/${BUCKET}/${objectPath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": file.type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "x-upsert": "false",
      },
      body: file,
    });
  } catch {
    throw new NetworkError("upload request failed");
  }

  if (!response.ok) {
    throw new Error(`upload rejected: ${response.status}`);
  }

  return `${baseUrl}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}
