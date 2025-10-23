import { NextResponse } from "next/server";
import ImageKit from "imagekit";

export const runtime = "nodejs";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileId } = body;
    if (!fileId) return NextResponse.json({ success: false, error: "fileId required" }, { status: 400 });

    const res = await imagekit.deleteFile(fileId);
    return NextResponse.json({ success: true, raw: res });
  } catch (err: any) {
    console.error("Failed to delete file from ImageKit:", err);
    return NextResponse.json({ success: false, error: err.message ?? String(err) }, { status: 500 });
  }
}
