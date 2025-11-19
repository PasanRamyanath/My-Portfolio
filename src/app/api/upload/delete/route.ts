import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

function createImageKitInstance() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !urlEndpoint) return null;

  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? "",
    privateKey,
    urlEndpoint,
  });
}

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return cloudinary;
}

interface DeleteRequestBody {
  fileId: string;
}

interface DeleteResponseSuccess {
  success: true;
  raw: unknown;
}

interface DeleteResponseError {
  success: false;
  error: string;
}

export async function POST(request: Request) {
  try {
  const imagekit = createImageKitInstance();
  const cloud = configureCloudinary();
    if (!imagekit) {
      console.error("ImageKit env missing on server: IMAGEKIT_PRIVATE_KEY and NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT are required");
      return NextResponse.json({ success: false, error: "Server misconfiguration: ImageKit keys missing" }, { status: 500 });
    }

    const body: DeleteRequestBody = await request.json();

    if (!body.fileId) {
      const errorResponse: DeleteResponseError = {
        success: false,
        error: "fileId required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    // Attempt ImageKit deletion first (most images)
    let deleted: unknown = null;
    try {
      deleted = await imagekit.deleteFile(body.fileId);
      return NextResponse.json({ success: true, raw: deleted });
    } catch (ikErr) {
      console.warn("ImageKit deletion failed or not applicable, attempting Cloudinary", ikErr);
      // Fallback to Cloudinary (videos). Cloudinary uses public_id; we mapped it to fileId earlier.
      if (!cloud) {
        return NextResponse.json({ success: false, error: "Could not delete file: ImageKit delete failed and Cloudinary not configured" }, { status: 500 });
      }
      try {
        const cloudRes = await cloud.uploader.destroy(body.fileId, { resource_type: "video" });
        if (cloudRes?.result !== 'ok') {
          return NextResponse.json({ success: false, error: `Cloudinary deletion failed: ${cloudRes?.result || 'unknown'}` }, { status: 500 });
        }
        return NextResponse.json({ success: true, raw: cloudRes });
      } catch (cloudErr) {
        console.error("Cloudinary deletion error", cloudErr);
        return NextResponse.json({ success: false, error: "Cloudinary deletion error" }, { status: 500 });
      }
    }
  } catch (err: unknown) {
    console.error("Failed to delete file from ImageKit:", err);

    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    const errorResponse: DeleteResponseError = {
      success: false,
      error: message,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
