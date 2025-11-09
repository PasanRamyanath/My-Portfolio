import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    domains: ["ik.imagekit.io", "firebasestorage.googleapis.com", "res.cloudinary.com", "images.unsplash.com", "i.imgur.com"],
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
  },
};

export default nextConfig;
