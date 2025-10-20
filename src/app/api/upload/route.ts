import { NextResponse } from "next/server";
import ImageKit from "imagekit";

// Ensure this route runs in a Node runtime (ImageKit Node SDK requires Node APIs)
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
    const file = formData.get("file") as File | null;

    if (!file) {
      console.warn("No file found in form data");
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const fileName = (file as any).name ?? `upload-${Date.now()}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log(`Uploading file ${fileName} (${buffer.length} bytes) to ImageKit`);

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName,
      folder: "/uploads",
    });

    console.log("ImageKit response:", uploadResponse);

    if (!uploadResponse || !uploadResponse.url) {
      return NextResponse.json({ success: false, error: "ImageKit upload failed, no url returned", raw: uploadResponse }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: uploadResponse.url });
  } catch (error: any) {
    console.error("Image upload failed:", error);
    return NextResponse.json({ success: false, error: error.message ?? String(error) }, { status: 500 });
  }
}
