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
    console.log("/api/upload called");
    console.log("IMAGEKIT keys present:", {
      public: !!process.env.IMAGEKIT_PUBLIC_KEY,
      private: !!process.env.IMAGEKIT_PRIVATE_KEY,
      endpoint: !!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      console.warn("No valid file found in form data");
      return NextResponse.json(
        { success: false, error: "No file uploaded or invalid file" },
        { status: 400 }
      );
    }

    const fileName = file.name || `upload-${Date.now()}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Uploading file ${fileName} (${buffer.length} bytes) to ImageKit`);

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName,
      folder: "/uploads",
    });

    console.log("ImageKit response:", uploadResponse);

    if (!uploadResponse || !uploadResponse.url) {
      return NextResponse.json(
        { success: false, error: "ImageKit upload failed, no url returned", raw: uploadResponse },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: uploadResponse.url, fileId: uploadResponse.fileId });
  } catch (err: unknown) {
    console.error("Image upload failed:", err);

    const errorMessage =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
