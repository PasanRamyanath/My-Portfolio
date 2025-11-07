import { NextResponse } from "next/server";
import ImageKit from "imagekit";

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

  const res = await imagekit.deleteFile(body.fileId);
    const successResponse: DeleteResponseSuccess = {
      success: true,
      raw: res,
    };
    return NextResponse.json(successResponse);
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
