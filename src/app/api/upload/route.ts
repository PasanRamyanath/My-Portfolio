import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import ImageKit from "imagekit";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for video uploads

function createImageKitInstance() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !urlEndpoint) return null;

  // Public key is not required on the server; pass empty string if missing.
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

export async function POST(request: Request) {
  try {
    console.log("/api/upload called");
    const imagekit = createImageKitInstance();
    const cloud = configureCloudinary();
    // imagekit may be null if not configured; we'll handle a dev fallback below
    if (!cloud) {
      console.warn("Cloudinary env missing: CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET not all set. Video uploads will fail.");
    }

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
  const isVideo = /\.(mp4|mov|webm|mkv|avi)$/i.test(fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If it's a video, try Cloudinary first
    if (isVideo) {
      if (!cloud) {
        return NextResponse.json({ success: false, error: "Video upload attempted but Cloudinary is not configured" }, { status: 500 });
      }
      console.log(`Uploading video ${fileName} (${buffer.length} bytes) to Cloudinary`);
      try {
        // For large files, use streaming upload via temporary file to avoid memory/timeout issues
        const uploadsDir = path.join(process.cwd(), "tmp");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const tempPath = path.join(uploadsDir, `temp-${Date.now()}-${fileName}`);
        
        // Write buffer to temporary file
        await fs.promises.writeFile(tempPath, buffer);
        
        try {
          // Upload using file path with chunked upload for large files
          const cloudRes = await cloud.uploader.upload(tempPath, {
            resource_type: "video",
            folder: "portfolio_uploads",
            public_id: fileName.replace(/\.[^.]+$/, ""),
            chunk_size: 6000000, // 6MB chunks for better upload reliability
            timeout: 240000, // 4 minute timeout
          });
          
          // Clean up temp file
          await fs.promises.unlink(tempPath).catch(() => {});
          
          if (!cloudRes?.secure_url) {
            return NextResponse.json({ success: false, error: "Cloudinary video upload failed" }, { status: 500 });
          }
          // Return fileId mapped to public_id so deletion code can treat uniformly.
          return NextResponse.json({ success: true, url: cloudRes.secure_url, provider: "cloudinary", fileId: cloudRes.public_id });
        } catch (uploadErr) {
          // Clean up temp file on error
          await fs.promises.unlink(tempPath).catch(() => {});
          throw uploadErr;
        }
      } catch (e) {
        console.error("Cloudinary upload error", e);
        return NextResponse.json({ success: false, error: "Cloudinary upload error" }, { status: 500 });
      }
    }

    // Otherwise treat as image and use ImageKit if available; else dev fallback to local disk
    if (imagekit) {
      console.log(`Uploading image ${fileName} (${buffer.length} bytes) to ImageKit`);
      const uploadResponse = await imagekit.upload({ file: buffer, fileName, folder: "/uploads" });
      console.log("ImageKit response:", uploadResponse);
      if (!uploadResponse || !uploadResponse.url) {
        return NextResponse.json({ success: false, error: "ImageKit upload failed, no url returned", raw: uploadResponse }, { status: 500 });
      }
      return NextResponse.json({ success: true, url: uploadResponse.url, fileId: uploadResponse.fileId, provider: "imagekit" });
    }

    // Dev fallback: persist file under public/uploads and return a local URL
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const targetPath = path.join(uploadsDir, `${Date.now()}-${safeName}`);
      await fs.promises.writeFile(targetPath, buffer);
      const publicUrl = `/uploads/${path.basename(targetPath)}`;
      console.log("Saved local upload:", targetPath);
      return NextResponse.json({ success: true, url: publicUrl, provider: "local", fileId: null });
    } catch (e) {
      console.error("Local upload fallback failed", e);
      return NextResponse.json({ success: false, error: "No upload provider configured and local fallback failed" }, { status: 500 });
    }
  } catch (err: unknown) {
    console.error("Image upload failed:", err);

    const errorMessage =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
